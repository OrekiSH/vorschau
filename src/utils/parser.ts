import { PreviewerExternal } from '../config';

export const htmlElementReg = /<\S+\s*\S*>/;
export const templateBlockReg = /<template[^>]*>([\s\S]+)<\/template>/;
export const scriptBlockReg = /<script[^>]*>([\s\S]+)<\/script>/;
export const styleBlockReg = /<style[^>]*>([\s\S]+)<\/style>/;
export const defineComponentBlockReg = /defineComponent\(([\s\S]+)\)/;
export const importReg = /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/mg;
export const allAsImportReg = /\s+\*\s+as\s+/;
export const someAsImportReg = /(\S+)\s+as\s+([^\s,]+)/g;

export function transformImportCode(
  imports: string[], externalMap: Record<string, PreviewerExternal>,
) {
  return imports.map((pkg) => {
    let result = pkg;
    /*
    * 1.
    * import Vue from 'vue';
    * to
    * const vue = Vue;
    *
    * 2.
    * import { createVNode as _createVNode } from 'vue';
    * to
    * const { createVNode: _createVNode } = Vue;
    *
    * 3.
    * import * as mod from 'mod';
    * const mod = Mod;
    */
    result = result.replace('import', 'const').replace('from', '=');
    // * as
    result = result.replace(allAsImportReg, ' ');
    // foo as bar => bar: foo
    result = result.replaceAll(someAsImportReg, (match, p1, p2) => `${p1}: ${p2}`);

    if (!result.endsWith(';')) result += ';';
    Object.keys(externalMap).forEach((k) => {
      const val = externalMap[k];
      result = result.replace(`'${k}'`, val.global).replace(`"${k}"`, val.global).trim();
      if (!result.endsWith(';')) result += ';';
    });

    return result;
  }).join(' ');
}

export function runInSandbox(code: string) {
  const sandbox = new Proxy(Object.create({}), {
    // @ts-ignore
    get(target: Window, prop: keyof Window) {
      return target[prop] || window[prop];
    },
    // @ts-ignore
    set(target, prop, val) {
      // eslint-disable-next-line no-param-reassign
      target[prop] = val;
    },
  });

  new Function(`
    return function (window) {
      with(window) {
        ${code}
      }
    };
  `)()(sandbox);

  return sandbox;
}

export const vue2Jsx = 'babel-plugin-transform-vue-jsx';
export const vue3Jsx = '@vue/babel-plugin-jsx';
export const reactJsx = '@babel/plugin-transform-react-jsx';
