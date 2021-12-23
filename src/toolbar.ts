import copy from 'copy-to-clipboard';
import snippetsIcon from './themes/ant-design/snippets.svg';
import checkIcon from './themes/ant-design/check.svg';
import codeIcon from './themes/ant-design/code.svg';
import { ICreatePreviewerConfig } from './config';

// copy source code, 拷贝源代码
export function createCopyButton(config: ICreatePreviewerConfig) {
  const copyButton = document.createElement('span');
  copyButton.className = 'toolbar-action';
  copyButton.setAttribute('position', 'top');
  resetCopyButton();

  function copySourceCode() {
    copy(config.code);
    copyButton.setAttribute('tooltip', 'Copyed!');
    copyButton.innerHTML = checkIcon;
  }
  function resetCopyButton() {
    copyButton.setAttribute('tooltip', 'Copy code');
    copyButton.innerHTML = snippetsIcon;
  }

  copyButton.addEventListener('click', copySourceCode);
  copyButton.addEventListener('mouseleave', resetCopyButton);

  function cleanUp() {
    copyButton.removeEventListener('click', copySourceCode);
    copyButton.removeEventListener('mouseleave', resetCopyButton);
  }

  return { el: copyButton, cleanUp };
}

// show/hide source code, 展示/隐藏源代码
export function createSourceButton(config: ICreatePreviewerConfig, sourceCode: HTMLElement) {
  let visible = !!config.showCode;
  const sourceButton = document.createElement('span');
  sourceButton.className = 'toolbar-action';
  sourceButton.setAttribute('position', 'top');
  sourceButton.innerHTML = codeIcon;
  resetSourceButton();
  function toggleSourceCodeVisible() {
    visible = !visible;
    resetSourceButton();
  }
  function resetSourceButton() {
    // eslint-disable-next-line no-param-reassign
    if (sourceCode) sourceCode.style.display = visible ? 'block' : 'none';
    sourceButton.setAttribute('tooltip', `${visible ? 'Hide' : 'Show'} code`);
  }
  sourceButton.addEventListener('click', toggleSourceCodeVisible);

  function cleanUp() {
    sourceButton.removeEventListener('click', toggleSourceCodeVisible);
  }

  return { el: sourceButton, cleanUp };
}

// toolbar area, 工具栏区域
export function createToolbarArea(config: ICreatePreviewerConfig, sourceCode: HTMLElement) {
  const el = document.createElement('div');
  el.className = 'toolbar-area';

  // copy source code
  const { el: copyButton, cleanUp: copyButtonCleanUp } = createCopyButton(config);
  el.appendChild(copyButton);

  // hide/show source code
  const { el: sourceButton, cleanUp: sourceButtonCleanUp } = createSourceButton(config, sourceCode);
  el.appendChild(sourceButton);

  // clean up
  function cleanUp() {
    copyButtonCleanUp();
    sourceButtonCleanUp();
  }

  return { el, cleanUp };
}
