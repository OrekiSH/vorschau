# vorschau

✨A universal demo code previewer

## Usage

``` html
<script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.16.5/babel.min.js" type="application/javascript"></script>
  <script src="https://cdn.jsdelivr.net/npm/@umd-pkg/babel-plugin-jsx@1.1.1-beta.0/dist/index.min.js"></script>

  <script>
    Vorschau.createPreviewer({
      el: '#foo',
      lang: 'vue3',
      externals: {
        vue: {
          global: 'Vue',
          script: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/vue/3.2.6/vue.global.js',
          highPriority: true,
        },
        'element-plus': {
          global: 'ElementPlus',
          script: 'https://cdn.jsdelivr.net/npm/element-plus@1.2.0-beta.6/dist/index.full.js',
          style: 'https://cdn.jsdelivr.net/npm/element-plus@1.2.0-beta.3/dist/index.css',
        },
      },
      plugins: ['ElementPlus'],
      code: `
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0);
    function add() {
      count.value += 1;
    }
    window.foo = 'foo';

    return { count, add };
  },
  render() {
    return <el-button onClick={this.add}>{this.count}</el-button>
  }
})`,
    })
  </script>
</script>
```

