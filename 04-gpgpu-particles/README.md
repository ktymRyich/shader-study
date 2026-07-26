# 04 - GPGPU パーティクル (Flow Field)

> **iPad でやる場合**: [3D Playground](https://ktymryich.github.io/shader-study/playground3d/) のプリセット「04 入門: 頂点パーティクル」で flow field・gl_PointSize・加算合成の感覚を掴める。ただしこれは状態を持たない簡易版 — 本物のピンポン (GPGPU) の実装は PC でやる (このモジュールの本体)。

## 目標

最終作品のビジュアルの核。数万〜数十万のパーティクルを GPU 上でシミュレートし、flow field (ノイズの勾配) に沿って漂わせる。

## フォーカス — 今学ぶこと / 流していいこと

**今学ぶ (概念が2つだけ。ただしどちらも重い)**
- 「テクスチャ = データの入れ物」への頭の切り替え: RGBA の4チャンネルを色ではなく (x, y, z, 寿命) として使う。これが GPGPU の本質で、UE の Niagara でも同じ発想 (Attribute を GPU 上に持つ) が出てくる
- ピンポンの仕組み: 「前フレームの位置テクスチャを読み → 次の位置を計算して別のテクスチャに書き → 入れ替える」。なぜ2枚必要なのか (GPU は同じテクスチャへの読み書き同時が不可) まで理解する
- flow field: ノイズを「各点での進行方向」として読む再解釈。02 の資産がそのまま使える

**流していい**
- GPUComputationRenderer のソースコード: 中で上記ピンポンをやってくれるヘルパー。概念さえ分かっていればブラックボックスでよい
- float テクスチャのフォーマット差 (HalfFloat / Float、OS・GPU による対応差): ハマったら調べる、で十分
- パーティクルの描画側 (Points + 頂点シェーダーでテクスチャから位置を読む) の細部: 写経してから読み解く順序でよい

## 参考

- [Codrops: Crafting a dreamy particle effect with three.js and GPGPU](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/) — 無料で読める実装解説記事。まずこれを写経してから改造する
- three.js の `GPUComputationRenderer` (examples/jsm/misc/GPUComputationRenderer.js)
- (任意・有料) Three.js Journey の "GPGPU Flow Field Particles" レッスン — Codrops より丁寧な解説が欲しければ

## 仕組みの要点 (事前に読む)

パーティクルの位置を JS 側の配列で毎フレーム更新するのは数千個が限界。GPGPU は「位置情報をテクスチャとして GPU 上に持ち、fragment shader で次の位置を計算 → その結果をまた次のフレームの入力にする (ピンポン)」ことで、数十万パーティクルを 60fps で回す技法。

## 課題

1. Codrops記事のデモを再現し、自分の環境で動かす
2. パーティクルの移動則を、02 で作った noise/fBm ベースの flow field に差し替える
3. 加算合成 (`AdditiveBlending`) + `depthWrite: false` で、光る粒子っぽい見た目に調整する (Rift S 調査時のメモにもあった定石)
4. パーティクル数を段階的に増やし、Quest 3 PCVR 想定のフレーム予算内 (80-90Hz なら 1フレーム 11-12.5ms) でどこまで耐えるか、`performance.now()` やブラウザの Performance タブで計測する

## 完了したら

ここまでで「広い空間+パーティクル」のプロトタイプができているはず。`05-raymarching-sdf/` (空間表現の強化) か `07-webxr-integration/` (先に実機確認したい場合) のどちらに進んでも良い。
