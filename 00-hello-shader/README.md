# 00 - Hello Shader

## 目標

three.js から GLSL シェーダーに値を渡す配線 (uniform, varying) を体感し、GPU パイプラインのメンタルモデルを作る。

## フォーカス — 今学ぶこと / 流していいこと

コード内にも `★今理解する` / `〔おまじない〕` のコメントで区別を入れてある。

**今学ぶ (3つだけ)**
- uniform: JS → GPU へ値を送る唯一の窓口 (`uniforms.uTime` の流れを追う)
- ShaderMaterial: 見た目の計算を自作の vertex/fragment シェーダーに差し替える宣言
- 並列実行モデル: fragment shader は「全ピクセルが同時に同じコードを実行し、自分の座標 (vUv) だけが違う」。for ループで塗るのではない

**流していい**
- camera / renderer / resize / Clock などの three.js 定型文 → 03 で正面から学ぶ
- vertex.glsl の `projectionMatrix * modelViewMatrix * ...` の行 → 03 まで「座標変換のおまじない」でよい。コピーして使い回す

## 起動

```bash
cd D:\MyProjects\vr-installation\study
npm install   # 初回のみ
npm run dev
```

ブラウザで `http://localhost:5173/00-hello-shader/` を開く。画面いっぱいに紫〜黄色のグラデーション正方形が出れば成功。

## 仕組みのメモ

- `vertex.glsl`: 頂点ごとに実行される。ここでは何もせず、頂点の `uv` 座標 (0〜1 の範囲) をそのまま `fragment.glsl` に `varying vec2 vUv` として渡しているだけ
- `fragment.glsl`: ピクセルごとに実行される。`vUv` を色に変換して `gl_FragColor` に書き込むと、その色がピクセルに出る
- `main.js`: three.js 側。`uniforms.uTime` を毎フレーム更新して GPU に送っている (`uTime` は今の fragment.glsl ではまだ使っていない — 次の課題で使う)
- `.glsl` ファイルの読み込みは Vite 標準の `?raw` インポート (`import x from './fragment.glsl?raw'`) を使っている。プラグイン不要でファイルをただの文字列として import できる。以降のモジュールでも同じ書き方をする

## 課題

1. **[必須]** `fragment.glsl` の「ステップ2」の TODO を埋めて、色が時間で変化するようにする
2. **[必須]** 「ステップ3」の TODO を埋めて、中心に円が浮かぶようにする (ヒント: `distance(vUv, vec2(0.5))` が 0.3 より小さいかどうかで色を分岐する `step()` 関数が使える)
3. **[任意]** `uMouse` という `vec2` の uniform を追加し、マウス座標に応じて円の位置が動くようにする (`main.js` に `mousemove` イベントリスナーを足す必要がある)

## 完了したら

- `01-glsl-fundamentals/` に進む
- 余力があれば [The Book of Shaders](https://thebookofshaders.com/?lan=jp) Ch.0〜2 を読み、ここで書いたコードとの対応を確認する
