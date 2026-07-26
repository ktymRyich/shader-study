# シェーダー学習ロードマップ — VRインスタレーション Phase 1

> 対応する vault プロジェクト: `wiki/projects/vr-installation/vr-installation.md`
> このフォルダは **学習用サンドボックス**。ここでの成果 (概念・書けるようになった技法) を、Phase 2 で Unreal Engine (Quest 3 PCVR) に翻訳して本番作品を作る。

## ゴール

- GLSL (vertex/fragment shader) を自分の手で書けるようになる
- 最終目標のビジュアル言語 = 「広くて静かな空間 (海/宇宙) + パーティクル」を、GPGPU パーティクルと raymarching で自作できるレベルに到達する
- 学んだ概念 (noise, flow field, SDF, 加算合成) は HLSL/Niagara に直訳できるものを選んで学ぶ (three.js 固有の API 知識を深追いしすぎない)

## 前提知識 (もう持っているもの)

- JS / three.js の実務経験 (VERDE で探索ゲームを完成させている) → シーン構築・カメラ・アセットの勘所は流用可
- GLSL・シェーダー数学は未経験 → ここがこのロードマップの本体

## 全体ロードマップ

| # | モジュール | 内容 | 目安 | 参考資料 |
|---|---|---|---|---|
| 00 | Hello Shader | GPUパイプラインの基礎、初めての自作シェーダー | 1日 | 本ガイド、Book of Shaders Ch.0 |
| 01 | GLSL 基礎文法 | uv, 関数, 色, shaping functions, 図形 | 3-5日 | [The Book of Shaders](https://thebookofshaders.com/) Ch.1-7 |
| 02 | ノイズと乱数 | random, Perlin/Simplex noise, fBm, セル状ノイズ | 3-5日 | Book of Shaders Ch.10-13 |
| 03 | three.js シェーダー統合 | ShaderMaterial, uniform/attribute/varying, 頂点変位 | 2-3日 | three.js docs, Three.js Journey (任意, 有料) |
| 04 | GPGPU パーティクル | FBO ピンポン, Flow Field | 1-2週 | [Codrops GPGPU記事](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/), Three.js Journey GPGPU Flow Field (任意) |
| 05 | Raymarching / SDF | 距離関数, ボリューム表現 | 1週 | [Inigo Quilez の記事群](https://iquilezles.org/articles/), [Michael Walczyk のチュートリアル](https://michaelwalczyk.com/blog-ray-marching.html) |
| 06 | オーディオリアクティブ | AnalyserNode → uniform | 2-3日 | MDN Web Audio API |
| 07 | WebXR 統合・実機確認 | Quest 3 で Hello WebXR、パフォーマンス計測 | 2-3日 | MDN WebXR, three.js WebXR examples |

有料リソースについて: [Three.js Journey](https://threejs-journey.com/) ($95前後) は 03〜04 を体系立てて学べる決定版だが、無料の Book of Shaders + Codrops 記事だけでも同じ地点まで到達可能。まず無料ルートで進めて、詰まったら購入を検討すれば十分。

## 進め方のルール

0. **全てを理解しようとしない**。各モジュールの README に「フォーカス — 今学ぶこと / 流していいこと」の節がある。「流していい」と書かれたものは、後のモジュールで回収されるか、そもそも覚える必要がない定型文。分からない行に出会ったら、まずこの節を見て「今の敵かどうか」を判定する (00 のコード内にも `★今理解する` / `〔おまじない〕` のコメントで同じ区別を入れてある)
1. 各モジュールフォルダに `README.md` (課題と参考リンク) がある。コードが用意されているのは `00` だけ — `01` 以降は自分で `index.html` / `main.js` / シェーダーファイルを作るところから始める (この「ゼロから配線する」作業自体が学習。`00` をコピーして雛形にしてよい)
2. 各モジュールの成果物は動くデモとして残す。後で見返して「あの時のあの効果、どう書いたっけ」を検索できる資産にする
3. 詰まったら答えを見る前に 15分は自分で試行錯誤する。Book of Shaders は「エディタでいじって壊してみる」ことを前提にした教材なので、写経で終わらせない
4. 週1回、`wiki/projects/vr-installation/vr-installation.md` の進捗を更新する (Claude に頼めば追記してくれる)

## 開発環境の起動

```bash
cd D:\MyProjects\vr-installation\study
npm install
npm run dev
```

`npm run dev` 後、`http://localhost:5173/00-hello-shader/` のようにモジュールのフォルダパスをブラウザで開く (Vite はサブフォルダの `index.html` をそのまま配信できる)。

## Day 1 の具体的な進め方

1. `npm install` を実行して環境を作る
2. `00-hello-shader/` を開き、`README.md` の課題を読む (UV グラデーションは最初から表示される状態になっている)
3. `fragment.glsl` の TODO (ステップ2: 時間変化、ステップ3: 円を描く) を埋める
4. 慣れてきたら [The Book of Shaders 日本語版](https://thebookofshaders.com/?lan=jp) の Ch.0〜2 を読み、`fragment.glsl` を自分で改造して遊ぶ (色を変える, 縞模様にする, など)
5. 今日はここまでで十分。次回は `01-glsl-fundamentals/` へ

## Phase 2 (UE移行) へのメモ欄

学習を進める中で「これは UE でどう書くんだろう」と思った技法があれば、ここにメモを追記していく (今は空欄)。

- (未記入)
