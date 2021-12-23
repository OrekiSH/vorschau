import { v4 as uuidv4 } from 'uuid';
import * as Prism from 'prismjs';
import { ICreatePreviewerConfig, APP } from './config';
import { createToolbarArea } from './toolbar';
import { parseVue } from './parsers/vue';
import { mountIframe } from './utils/iframe';
import { runInSandbox, templateBlockReg } from './utils/parser';

// preview area, 预览区域
export function createPreviewArea(): { id: string, el: HTMLElement } {
  const container = document.createElement('div');
  container.className = 'preview-area';
  const el = document.createElement('div');
  const id = uuidv4();
  el.setAttribute('data-id', id);
  container.appendChild(el);

  return { id, el: container };
}

// meta area: title + description, 元数据区域: 标题 + 描述

// source code area, 源代码区域
export function createSourceCodeArea(config: ICreatePreviewerConfig) {
  const el = document.createElement('div');
  el.className = 'sourcecode-area';
  const pre = document.createElement('pre');
  el.appendChild(pre);
  const code = document.createElement('code');

  const [, templateCode = ''] = config.code.match(templateBlockReg) || [];
  if (templateCode) {
    code.innerHTML = Prism.highlight(config.code, Prism.languages.markup, 'markup');
  } else {
    code.innerHTML = Prism.highlight(config.code, Prism.languages.javascript, 'javascript');
  }
  pre.appendChild(code);

  return el;
}

export async function mount(el: HTMLElement, config: ICreatePreviewerConfig) {
  const frag = document.createDocumentFragment();
  const demo = document.createElement('div');
  demo.className = `demo-block--${config.theme}`;
  frag.appendChild(demo);

  // preview
  const { id, el: preview } = createPreviewArea();
  const previewAreaSelector = `[data-id="${id}"]`;
  demo.appendChild(preview);
  // source code
  const sourceCode = createSourceCodeArea(config);
  demo.appendChild(sourceCode);
  // toolbar
  const { el: toolbar } = createToolbarArea(config, sourceCode);
  demo.insertBefore(toolbar, sourceCode);

  el.appendChild(frag);
  if (`${config.lang}`.startsWith('vue')) {
    mountVue(previewAreaSelector, config, id);
  }
}

export function mountVue(container: string, config: ICreatePreviewerConfig, id: string) {
  let app = null;

  try {
    if (!config.iframe) {
      const sourceCode = parseVue(container, config);
      const win = runInSandbox(sourceCode);
      if (win[APP]) app = win[APP];
    } else {
      const insideId = `${id}_inside`;
      const iframe = mountIframe(insideId, config);

      // preview area
      const el = document.querySelector(container);
      if (el) el.appendChild(iframe);
    }
  } catch (err) {
    console.error(err);
  }

  return { app };
}
