import { ICreatePreviewerConfig, PreviewerExternal } from './config';
import { mount } from './mount';
import { appendExternals } from './utils/dom';
import 'prismjs/themes/prism.css';
import './themes/index.scss';

let tasks: Function[] = [];
let invoked = false;
let externalMap: Record<string, PreviewerExternal> = Object.create(null);

function defineDefault(
  config: ICreatePreviewerConfig, key: keyof ICreatePreviewerConfig, value: any,
) {
  if (typeof config[key] === 'undefined') {
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    config[key] = value;
  }
}

export function createPreviewer(config: ICreatePreviewerConfig) {
  const { el } = config;
  const elem = (typeof el === 'string'
    ? document.querySelector(el)
    : el) as HTMLElement;
  defineDefault(config, 'theme', 'dumi');
  defineDefault(config, 'showCode', true);

  if (elem === null) {
    throw new TypeError(`[vorschau]: el ${el} not exists.`);
  }

  tasks.push(async () => {
    // clear content before mounting, 挂载之前清除元素内容
    elem.innerHTML = '';
    mount(elem, config);
  });

  // if not iframe mode, append to main document, 非iframe模式添加到主HTML
  if (!config.iframe) {
    externalMap = {
      ...externalMap,
      ...config.externals,
    };
  }

  // wait for all tasks appended into queue, 等待所有任务推入任务队列
  Promise.resolve().then(async () => {
    if (!invoked) {
      invoked = true;
      await appendExternals(externalMap);

      // run after externals appended, 外部依赖添加后执行任务
      tasks.map((task) => task());

      // cleanup tasks queue, 清空任务队列
      setTimeout(() => {
        invoked = false;
        tasks = [];
      });
    }
  });
}
