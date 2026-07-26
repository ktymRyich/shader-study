# 02 - ノイズと乱数

## 目標

`random()` → Perlin/Simplex noise → fBm (fractal Brownian motion) の積み上げを理解する。最終作品の「海・宇宙の揺らぎ」表現の土台。

## フォーカス — 今学ぶこと / 流していいこと

**今学ぶ**
- 「ノイズ = なめらかな乱数」という直感: random (バラバラ) → noise (なめらか) → fBm (重ねて複雑に) の3段階の見た目の違い
- ノイズの使い方: 入力 (uv や時間) をスケールする・オフセットする・複数オクターブ足す、で表情がどう変わるか。**パラメータをいじって目で覚える**のがこのモジュールの本体
- fBm の構造: 「周波数を倍に、振幅を半分にしながらノイズを足す」ループ。これは 04 の flow field でも 05 の地形でもそのまま使う

**流していい**
- Simplex noise 関数の実装内部 (勾配ベクトル、単体分割の数学): 一度眺めて「乱数の勾配を補間している」と分かれば十分。導出を追う必要はない。プロの現場でもコピペで使うのが普通
- `random()` の `fract(sin(dot(...)))` がなぜ乱数っぽくなるかの数学: 「sin の高周波部分を切り出すハック」という一行理解でよい

## 参考

- [The Book of Shaders](https://thebookofshaders.com/?lan=jp) Ch.10 (Random) 〜 Ch.13 (Fractal Brownian Motion)
- Simplex noise の GLSL 実装は自作せず既存の関数を使って良い。[Ashima Arts / stegu の webgl-noise](https://github.com/stegu/webgl-noise) から `noise2D.glsl` / `noise3D.glsl` をコピーして `shared/` に置き、`?raw` で import して自分のシェーダー文字列の先頭に連結する (このプロジェクトは `#include` が使えないので、JS 側で `noiseGlsl + '\n' + fragmentShader` のように文字列結合する)
- **重要なのは「中身をブラックボックスにしない」こと**。最低1回は `random()` だけで作った疑似ノイズと、Simplex noise の違いを目で見て確認する

## 課題

1. `random(vec2)` を自分で書き、砂嵐のようなノイズを表示する
2. Simplex/Perlin noise 関数を導入し、なめらかに揺れる雲/大理石模様を作る
3. `uTime` をノイズの第3引数 (or オフセット) として使い、アニメーションさせる
4. fBm (ノイズを複数オクターブ重ねる) で、より複雑な地形/波っぽいパターンを作る

## 完了したら

`shared/` に汎用ノイズ関数を置いておく (04 の GPGPU パーティクルで再利用する)。`03-threejs-shader-integration/` へ。
