import { ICreatePreviewerConfig } from '../config';
import { parseVue } from '../parsers/vue';
import { genExternalStyleHTML } from './dom';

export function createIframe(html: string) {
  const iframe = document.createElement('iframe');
  iframe.src = `data:text/html;charset=utf-8,${html}`;
  return iframe;
}

export function mountIframe(id: string, config: ICreatePreviewerConfig) {
  const sourceCode = parseVue(`[data-id="${id}"]`, config);
  const styles = genExternalStyleHTML(config);
  const scripts = Object.values(config?.externals || {}).filter((e) => e.script);
  const highPriority = scripts.filter((e) => e.highPriority).map((e) => `'${e.script}'`);
  const lowPriority = scripts.filter((e) => !e.highPriority).map((e) => `'${e.script}'`);

  const html = `
    <head>
      <style>* { margin: 0; }</style>
      ${styles}
    </head>
    <body>
      <div data-id="${id}"></div>

      <script>
        function appendScript(url) {
          return new Promise(function appendScript(resolve, reject) {
            var script = document.createElement('script');
            script.src = url;
            document.body.appendChild(script);

            script.onload = function onload() {
              script.onload = null;
              resolve(script);
            };
            script.onerror = function onerror() {
              script.onerror = null;
              reject(err);
            };
          });
        }
        var lowPriority = [${lowPriority}];
        var highPriority = [${highPriority}];
      </script>

      <script>
        Promise.all(highPriority.map(function (url) {
          return appendScript(url);
        })).then(function () {
          Promise.all(lowPriority.map(function (url) {
            return appendScript(url);
          })).then(function () {
            ${sourceCode}
            window.addEventListener('load', function load() {
              window.parent.postMessage(document.body.scrollHeight, '${window.location.origin}');
            });
          }).catch(function (err) {
            console.error(err);
          });
        }).catch(function (err) {
          console.error(err);
        });
      </script>
    </body>
  `;
  const iframe = createIframe(html);
  if (iframe) {
    const cb = (evt: MessageEvent) => {
      iframe.style.height = `${evt.data}px`;
      window.removeEventListener('message', cb);
    };
    window.addEventListener('message', cb);

    iframe.className = 'demo-block__iframe';
  }

  return iframe;
}
