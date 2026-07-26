# shared

モジュール横断で使い回すコード置き場 (例: 02 で導入する noise 関数、gui セットアップのヘルパーなど)。今はまだ空。

## GLSL 関数の使い回し方

このプロジェクトは `#include` が使えない (`?raw` インポートは単純な文字列読み込みのため)。共有 GLSL は文字列結合で合成する:

```js
import noiseGlsl from '../shared/noise3D.glsl?raw'
import fragmentShader from './fragment.glsl?raw'

const material = new THREE.ShaderMaterial({
  fragmentShader: noiseGlsl + '\n' + fragmentShader,
  // ...
})
```
