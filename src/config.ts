export type PreviewerTheme = 'dumi' | 'antd' | 'element-ui';

export type PreviewerLang = 'vue2' | 'vue3';

export type PreviewerCode = {
  title: string
  content: string
};

export type PreviewerExternal = {
  global: string
  script: string
  style?: string
  options?: Record<string, any>
  highPriority?: boolean
};

export interface ICreatePreviewerConfig {
  el: string | HTMLElement
  theme?: PreviewerTheme
  lang?: PreviewerLang
  code: string
  externals?: Record<string, PreviewerExternal>
  showCode?: boolean
  plugins?: string[]
  iframe?: boolean
  links?: string[]
  debug?: boolean
}

export const APP = 'vorschau_app';
