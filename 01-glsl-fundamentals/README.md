# 01 - GLSL 基礎文法

## 目標

GLSL の型・関数・shaping functions を使って、コードだけで図形やパターンを描けるようになる。

## フォーカス — 今学ぶこと / 流していいこと

**今学ぶ (このモジュールの主戦場は fragment.glsl のみ)**
- GLSL の型と書き味: `vec2/vec3/vec4`、swizzle (`color.rgb`, `uv.xy`)、`float` に必ず小数点を付ける文化 (`1.0`)
- 定番関数を手癖にする: `step` / `smoothstep` / `mix` / `fract` / `distance` / `length` — この6つで大半のパターンが描ける
- 「値 (0〜1) を色として目で見るデバッグ」— GLSL には console.log が無いので、これが唯一のデバッグ手段。最重要スキル

**流していい**
- main.js / vertex.glsl: 00 からコピーするだけ。中身の理解は 03 まで保留でよい (コピーして動かす、を繰り返すこと自体が配線の練習)
- 行列 (2D Matrices, Book of Shaders Ch.8): 回転・スケールが必要になったら戻ってくればよい
- GLSL のバージョン差 (GLSL ES 1.0 vs 3.0) の細かい話: three.js の ShaderMaterial が吸収してくれる

## 参考

- [The Book of Shaders 日本語版](https://thebookofshaders.com/?lan=jp) Ch.1〜7 (Getting started 〜 Shapes。Uniforms, Shaping functions, Colors を含む)
- 各章の右側にある実行可能エディタでまず遊んでから、下記の課題を **このフォルダの three.js プロジェクトに移植する** こと (Book of Shaders のエディタで満足せず、必ず three.js 側で動かす — 03 以降の統合作業の練習になる)

## セットアップ

`00-hello-shader/` をコピーしてこのフォルダに `index.html` / `main.js` / `vertex.glsl` / `fragment.glsl` を作るところから始める (配線を自分の手で書く)。

## 課題

1. `smoothstep` を使ってアンチエイリアスされた円を描く
2. 画面を格子状に分割し (`fract(vUv * N)`)、各セルに円を1つずつ描く
3. `mix()` で2色のグラデーションを作り、時間で色相が回るようにする
4. Book of Shaders の "Shapes" 章にある課題を1つ選び、three.js 側で再現する

## 完了したら

`02-noise-and-randomness/` へ。
