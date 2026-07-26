import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const page = (p) => fileURLToPath(new URL(p, import.meta.url))

// シェーダーは Vite 標準の `?raw` インポートで文字列として読み込む
// (例: import fragmentShader from './fragment.glsl?raw')
export default defineConfig({
  // GitHub Pages のサブパス (https://ktymryich.github.io/shader-study/) でも動くよう相対パスにする
  base: './',
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      // マルチページ構成: モジュールのデモページが増えたらここに追加する
      input: {
        index: page('index.html'),
        'hello-shader': page('00-hello-shader/index.html'),
        playground: page('playground/index.html'),
        playground3d: page('playground3d/index.html')
      }
    }
  }
})
