const { defineConfig } = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const esbuild = require('rollup-plugin-esbuild').default;
const scss = require('rollup-plugin-scss');
const svg = require('rollup-plugin-svg');
const json = require('@rollup/plugin-json');

function defineBundleConfig(format, minify = false) {
  let file = `./dist/index${minify ? '.min' : ''}.js`;
  if (format === 'cjs') file = './lib/index.js';
  if (format === 'esm') file = './es/index.js';

  return defineConfig({
    input: './src/index.ts',
    output: {
      file,
      format,
      name: 'Vorschau',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      esbuild({
        minify,
        jsx: 'preserve',
        jsxFactory: 'h',
      }),
      svg(),
      scss(),
      json(),
    ],
  });
}

module.exports = {
  defineBundleConfig,
};
