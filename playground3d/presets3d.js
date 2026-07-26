// 3D Playground のプリセット。各プリセットは vertex / fragment のペア + 表示モード。
// mode: 'mesh' = 分割済み平面 (128x128) / 'points' = 点群グリッド (200x200)
//
// vertex shader で使えるもの (three.js が自動で用意する):
//   attribute vec3 position / attribute vec2 uv / attribute vec3 normal
//   uniform mat4 projectionMatrix / modelViewMatrix / modelMatrix / viewMatrix
//   これらは宣言不要 (three.js が先頭に差し込む)。自作の attribute (aRandom) と
//   uniform (uTime など) は自分で宣言する。

const SIMPLEX_2D = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`

export const PRESETS_3D = [
  {
    id: '03-wave',
    label: '03 波打つ平面',
    mode: 'mesh',
    vertex: `uniform float uTime;
varying vec2 vUv;
varying float vElevation;
` + SIMPLEX_2D + `
void main() {
  vUv = uv;

  // 00 で「おまじない」だった行の正体:
  //   position (モデル座標) → modelViewMatrix (カメラから見た座標) → projectionMatrix (画面座標)
  // 頂点変位は、この変換の「前に」position をずらすこと

  vec3 pos = position;
  float elevation = snoise(pos.xy * 2.0 + uTime * 0.4) * 0.25;
  pos.z += elevation;
  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  // 課題1: snoise の入力スケール (2.0) と振幅 (0.25) を変えて波の性格を見る
  // 課題2: 2 つの周波数の波を足して、うねり + さざ波にする
  // 課題3: fragment タブに切り替えて、高さ (vElevation) で色を塗り分ける
}
`,
    fragment: `precision highp float;
varying vec2 vUv;
varying float vElevation;

void main() {
  // vertex shader から届いた高さで色を変える (varying の実践)
  vec3 deep = vec3(0.02, 0.08, 0.15);
  vec3 crest = vec3(0.4, 0.85, 0.8);
  vec3 color = mix(deep, crest, vElevation * 2.0 + 0.5);
  gl_FragColor = vec4(color, 1.0);
}
`,
  },
  {
    id: '03-attribute',
    label: '03 attribute (aRandom)',
    mode: 'mesh',
    vertex: `uniform float uTime;
attribute float aRandom; // 頂点ごとに異なる乱数 (JS 側で生成済み。0〜1)
varying vec2 vUv;
varying float vRandom;

void main() {
  vUv = uv;
  vRandom = aRandom;

  vec3 pos = position;
  // 頂点ごとに位相をずらして揺らす — uniform (全頂点共通) との違いを体感する
  pos.z += sin(uTime * 2.0 + aRandom * 6.2831) * 0.1 * aRandom;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  // 課題1: aRandom を使わず sin(uTime) だけにして、違い (全頂点が同時に動く) を見る
  // 課題2: 揺れの方向を z 以外 (x, y) にも広げる
}
`,
    fragment: `precision highp float;
varying vec2 vUv;
varying float vRandom;

void main() {
  vec3 color = mix(vec3(0.1, 0.2, 0.4), vec3(0.5, 0.9, 0.8), vRandom);
  gl_FragColor = vec4(color, 1.0);
}
`,
  },
  {
    id: '04-points',
    label: '04 入門: 頂点パーティクル',
    mode: 'points',
    vertex: `uniform float uTime;
attribute float aRandom;
varying float vRandom;
` + SIMPLEX_2D + `
void main() {
  vRandom = aRandom;

  vec3 pos = position;
  // ノイズを「その場所の流れの向き」として読む = flow field の入り口
  float angle = snoise(pos.xy * 1.5 + uTime * 0.1) * 3.1416;
  pos.x += cos(angle) * 0.08;
  pos.y += sin(angle) * 0.08;
  pos.z += snoise(pos.xy * 3.0 - uTime * 0.2) * 0.15;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // gl_PointSize = この頂点を何ピクセルの点として描くか (Points 描画専用の出力)
  // 遠くの点ほど小さく見えるよう、カメラからの距離 (-mvPosition.z) で割る
  gl_PointSize = (2.0 + aRandom * 4.0) * (3.0 / -mvPosition.z);

  // 注意: これは「頂点シェーダーパーティクル」= 位置が毎フレーム計算し直されるだけで、
  // 前フレームの状態を持たない。「状態を持つ」本物の GPGPU (ピンポン) は PC で 04 をやる
  // 課題1: 流れの速さ・スケールを変えて、渦っぽさを探る
  // 課題2: gl_PointSize を uTime で脈動させる
}
`,
    fragment: `precision highp float;
varying float vRandom;

void main() {
  // gl_PointCoord = 点スプライト内の 0〜1 座標。丸い粒に見せるための定石
  float d = distance(gl_PointCoord, vec2(0.5));
  float alpha = 1.0 - smoothstep(0.3, 0.5, d);

  vec3 color = mix(vec3(0.2, 0.5, 0.9), vec3(0.5, 0.95, 0.85), vRandom);

  // 加算合成 (JS 側で AdditiveBlending 設定済み) なので、重なった粒は光って見える
  gl_FragColor = vec4(color * alpha, alpha);
}
`,
  },
]
