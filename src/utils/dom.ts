import { ICreatePreviewerConfig, PreviewerExternal } from '../config';

export function appendScript(url: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);

    script.onload = () => {
      script.onload = null;
      resolve(script);
    };
    script.onerror = (err) => {
      script.onerror = null;
      reject(err);
    };
  });
}

export function appendStyle(url: string) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.head.appendChild(link);

    link.onload = () => {
      link.onload = null;
      resolve(link);
    };
    link.onerror = (err) => {
      link.onerror = null;
      reject(err);
    };
  });
}

export function appendExternals(externals: Record<string, PreviewerExternal>) {
  // @ts-ignore
  const externalList = Object.values(externals).filter((v) => !window[v]);
  const tasks = [
    ...externalList.filter((e) => e.script).map((e) => appendScript(e.script)),
    ...externalList.filter((e) => e.style).map((e) => appendStyle(e.style as string)),
  ];

  return Promise.all(tasks);
}

// main document <link> html, 主文档link标签HTML
export function getDocStyleHTML() {
  return Array.from(document.head.querySelectorAll('link'))
    .map((e) => e.outerHTML).join('');
}

// external <script> html, 外联script标签HTML
export function genExternalScriptHTML(config: ICreatePreviewerConfig) {
  return Object.values(config?.externals || {})
    .filter((e) => e.script)
    .map((e) => `<script src="${e.script}"></script>`)
    .join('');
}

// external <link> html, 外联link标签HTML
export function genExternalStyleHTML(config: ICreatePreviewerConfig) {
  return Object.values(config?.externals || {})
    .filter((e) => e.style)
    .map((e) => `<link rel="stylesheet" type="text/css" href="${e.style}">`)
    .join('');
}
