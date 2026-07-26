# 03 - three.js シェーダー統合

## 目標

`ShaderMaterial` を使いこなし、頂点シェーダー側で形状そのものを変形できるようになる (fragment shader = 色、vertex shader = 形、という分業の理解)。

## フォーカス — 今学ぶこと / 流していいこと

**今学ぶ (これまで「おまじない」と言ってきたものを回収する回)**
- vertex.glsl の `projectionMatrix * modelViewMatrix * vec4(position, 1.0)` の意味: モデル座標 → カメラ視点座標 → 画面座標、の変換パイプライン。頂点変位は「この変換の**前に** position をずらす」こと
- uniform / attribute / varying の3点セットの完全な区別: 全頂点共通の入力 / 頂点ごとの入力 / 頂点→ピクセルへの受け渡し (補間付き)
- ジオメトリは頂点の集まりでしかない、という実感: 分割数を上げないと変形が粗い、を目で確認する
- lil-gui でパラメータを外に出す習慣: 以降ずっと使うワークフロー

**流していい**
- EffectComposer の内部実装 (レンダーターゲットの仕組み): 「一度テクスチャに描いてから加工する」という一行理解でよい。ただしこの概念は 04 の GPGPU で本格的に使うので、頭の片隅に置いておく
- three.js の他のマテリアル (MeshStandardMaterial 等) との連携 (onBeforeCompile): 本番 (UE) では使わない知識なので深追いしない
- カメラの射影行列の中身 (fov から行列を作る数学): 使う分には不要

## 参考

- three.js docs: [ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial), [RawShaderMaterial](https://threejs.org/docs/#api/en/materials/RawShaderMaterial)
- (任意・有料) [Three.js Journey](https://threejs-journey.com/) の "Shaders" 章。体系立てて学びたい場合はここが決定版

## 課題

1. Plane を Simplex noise (02の成果物) で頂点変位させ、波打つ水面/地形を作る (ヒント: `PlaneGeometry(w, h, 128, 128)` のように分割数を上げないと頂点が足りず変形しない)
2. `attribute` を使って、頂点ごとに異なるランダム値を渡す (例: 頂点ごとに揺れの位相をずらす)
3. `EffectComposer` + カスタムポストプロセスパスを1つ作る (例: 画面全体に色収差やビネットをかける)
4. マテリアルの `uniforms` を `lil-gui` でリアルタイム調整できるようにする — パラメータチューニングの手戻りを減らす習慣づけ (`npm install lil-gui` が必要)

## 完了したら

`04-gpgpu-particles/` へ。ここからが本番作品の核心技術。
