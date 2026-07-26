// プリセット集。各モジュールの README と対応している。
// 使える uniform / varying (全プリセット共通):
//   varying vec2 vUv        — 0〜1 の画面座標 (左下が 0,0)
//   uniform float uTime     — 経過秒
//   uniform vec2 uResolution — 画面ピクセルサイズ
//   uniform vec2 uMouse     — タッチ/マウス位置 (0〜1, 左下原点)

const HEADER = `precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
`

// Ashima Arts / Stefan Gustavson の 2D simplex noise (MIT)
// https://github.com/stegu/webgl-noise
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

export const PRESETS = [
  {
    id: '00-gradient',
    label: '00 グラデーション',
    code: HEADER + `
void main() {
  // ステップ1 (できている): uv をそのまま色にしたグラデーション
  vec3 color = vec3(vUv.x, vUv.y, 0.5);

  // ステップ2 (TODO): uTime で色を時間変化させる
  // 例: color.b = 0.5 + 0.5 * sin(uTime);

  // ステップ3 (TODO): 中心からの距離で円を描く
  // ヒント: float d = distance(vUv, vec2(0.5));

  gl_FragColor = vec4(color, 1.0);
}
`,
  },
  {
    id: '01-shapes',
    label: '01 図形の練習',
    code: HEADER + `
void main() {
  vec3 bg = vec3(0.05, 0.06, 0.1);
  vec3 fg = vec3(0.4, 0.9, 0.8);

  // smoothstep でフチのなめらかな円
  float d = distance(vUv, vec2(0.5));
  float circle = 1.0 - smoothstep(0.24, 0.26, d);

  // 課題1: smoothstep の 2 つの値を近づけたり離したりして、フチのボケ方を見る
  // 課題2: fract(vUv * 4.0) で画面を 4x4 に分割し、各セルに円を描く
  // 課題3: mix() で 2 色のグラデーションを作り、uTime で色相を動かす
  // 課題4: 円を uMouse の位置に追従させる

  vec3 color = mix(bg, fg, circle);
  gl_FragColor = vec4(color, 1.0);
}
`,
  },
  {
    id: '02-noise',
    label: '02 ノイズ (simplex入り)',
    code: HEADER + SIMPLEX_2D + `
// snoise(vec2) が使える (-1〜1 を返す)。実装は上に貼ってあるが、
// 中身は「乱数の勾配をなめらかに補間している」と分かれば OK (02 README 参照)

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;          // 周波数を倍に
    amplitude *= 0.5;  // 振幅を半分に
  }
  return value;
}

void main() {
  vec2 p = vUv * 3.0;            // スケール: 数字を変えると模様の細かさが変わる
  float n = fbm(p + uTime * 0.1); // 時間でゆっくり流す

  // -1〜1 を 0〜1 に写すイディオム
  n = 0.5 + 0.5 * n;

  // 課題1: fbm を使わず snoise 単発にして違いを見る
  // 課題2: ループ回数 (オクターブ) を 1〜8 で変えて見比べる
  // 課題3: n を閾値で切って (step / smoothstep) 雲や海面の模様にする

  vec3 deep = vec3(0.01, 0.05, 0.12);
  vec3 glow = vec3(0.3, 0.8, 0.75);
  gl_FragColor = vec4(mix(deep, glow, n), 1.0);
}
`,
  },
  {
    id: '05-raymarch',
    label: '05 raymarching 入門',
    code: HEADER + `
// raymarching の最小構成: 球 1 個 + 平行光 1 灯 (05 README 参照)

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// シーン全体の SDF。形を足したいときはここに min() で追加する
float map(vec3 p) {
  return sdSphere(p, 1.0);
}

void main() {
  // 画面座標を -1〜1 に写し、アスペクト比を補正
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 ro = vec3(0.0, 0.0, 3.0);            // レイの出発点 (カメラ)
  vec3 rd = normalize(vec3(uv, -1.5));      // レイの方向

  // 基本ループ: SDF の値ぶんだけ安全に進む
  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 64; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001) { hit = true; break; }
    t += d;
    if (t > 20.0) break;
  }

  vec3 color = vec3(0.02, 0.03, 0.05);
  if (hit) {
    vec3 p = ro + rd * t;
    // 法線 = SDF の勾配 (各軸に少しずらして差分を取る)
    vec2 e = vec2(0.001, 0.0);
    vec3 n = normalize(vec3(
      map(p + e.xyy) - map(p - e.xyy),
      map(p + e.yxy) - map(p - e.yxy),
      map(p + e.yyx) - map(p - e.yyx)));
    float diff = max(dot(n, normalize(vec3(1.0, 1.0, 0.5))), 0.0);
    color = vec3(0.2, 0.5, 0.7) * diff + vec3(0.05);
  }

  // 課題1: 球の位置を uTime で動かす (map の中で p をずらす)
  // 課題2: 球をもう 1 個追加して min() で合体させる
  // 課題3: min を smin (smooth minimum) に変えて融合させる
  //   float smin(float a, float b, float k) {
  //     float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  //     return mix(b, a, h) - k * h * (1.0 - h);
  //   }

  gl_FragColor = vec4(color, 1.0);
}
`,
  },
  {
    id: 'blank',
    label: '白紙',
    code: HEADER + `
void main() {
  vec3 color = vec3(0.0);
  gl_FragColor = vec4(color, 1.0);
}
`,
  },
]
