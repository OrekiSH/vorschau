import { APP, ICreatePreviewerConfig } from '../config';
import {
  defineComponentBlockReg, htmlElementReg, importReg, reactJsx, scriptBlockReg,
  templateBlockReg, transformImportCode, vue2Jsx, vue3Jsx,
} from '../utils/parser';

export function genComponentOptionCode(
  optionCode: string,
  templateCode?: string,
  el?: string,
) {
  let result = '';

  if (!el) {
    result = `Object.assign(
      ${optionCode.trim()},
      ${templateCode ? `{ template: \`${templateCode}\` }` : undefined},
    )`;
  } else {
    result = `Object.assign(
      ${optionCode.trim()},
      { el: '${el}' },
      ${templateCode ? `{ template: \`<div>${templateCode}</div>\` }` : undefined},
    )`;
  }

  return result;
}

export function transformJSX(code: string, config: ICreatePreviewerConfig) {
  const { externals = {} } = config || {};
  const babel = (window as any).Babel;
  if (!babel) return code;

  let result = code;
  let jsxPlugin = null;
  const isVue3 = config?.lang === 'vue3';

  const vue3JsxPlugin = (window as any)[externals?.[vue3Jsx]?.global || vue3Jsx];
  const vue2JsxPlugin = (window as any)[externals?.[vue2Jsx]?.global || vue2Jsx];
  if (isVue3 && vue3JsxPlugin) jsxPlugin = vue3JsxPlugin;
  if (!isVue3 && vue2JsxPlugin) jsxPlugin = vue2JsxPlugin;

  try {
    // react jsx fallback, React JSX作为备选
    let opt = {
      plugins: [
        ['transform-react-jsx', {
          pragma: 'h',
          ...externals?.[reactJsx]?.options,
        } as Record<string, any>],
      ],
    };

    if (jsxPlugin) {
      babel.registerPlugin('vue-jsx', jsxPlugin);
      opt = {
        plugins: [
          ['vue-jsx', {
            ...externals?.[vue2Jsx]?.options || externals?.[vue3Jsx]?.options,
          }],
        ],
      };
    }
    result = babel.transform(result, opt)?.code || result;
  } catch (err) {
    console.error(err);
  }

  return result;
}

export function parseVue(el: string, config: ICreatePreviewerConfig) {
  let result = '';

  const {
    code, externals = {}, lang, plugins,
  } = config;
  const [, templateCode = ''] = code.match(templateBlockReg) || [];
  const [, scriptCode = ''] = code.match(scriptBlockReg) || [];
  const [, defineComponentCode = ''] = code.match(defineComponentBlockReg) || [];

  const isVue3 = lang === 'vue3';
  let optionCode = defineComponentCode
    || scriptCode.replaceAll(importReg, '').replace('export default', '');
  optionCode = genComponentOptionCode(optionCode, templateCode, isVue3 ? undefined : el);

  // template syntax or JSX syntax, template语法或JSX语法
  if ((templateCode && scriptCode) || defineComponentCode) {
    result = isVue3
      ? `
        const app = Vue.createApp(${optionCode});
        window.${APP} = app;
        const plugins = [${Array.isArray(plugins) ? plugins : ''}];
        plugins.forEach(function(plugin) {
          app.use(plugin);
        });

        app.mount('${el}');
      `
      : `
        const app = new Vue(${optionCode});
        window.${APP} = app;
      `;
  }

  // transpile code, 转义代码
  if (scriptCode.match(htmlElementReg) || defineComponentCode.match(htmlElementReg)) {
    result = transformJSX(result, config);
  }

  // append imports and transform to obejct destructuring assignment, 添加引入模块，并转换为对象解构语法
  const imports: string[] = `${scriptCode || code}${result}`.match(importReg) || [];
  const importCode = transformImportCode(imports, externals);

  result = `${importCode}\n${result.replaceAll(importReg, '')}`;

  const babel = (window as any).Babel;
  if (babel) {
    try {
      result = babel.transform(result, {
        presets: ['env'],
      })?.code || result;
    } catch (err) {
      console.error(err);
    }
  }

  if (config.debug) {
    console.debug('[vorschau DEBUG]: source code: ', result);
  }

  return result;
}
