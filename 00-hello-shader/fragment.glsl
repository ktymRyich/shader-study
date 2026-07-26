uniform float uTime;
varying vec2 vUv;

void main() {
  // ステップ1 (できている): uv の x/y をそのまま色にした単純なグラデーション
  vec3 color = vec3(vUv.x, vUv.y, 0.5);

  // ステップ2 (TODO): uTime を使って色を時間変化させてみる
  // 例: color.b = 0.5 + 0.5 * sin(uTime);

  // ステップ3 (TODO, 余裕があれば): vUv を中心 (0.5, 0.5) からの距離に変換して
  // 円を描いてみる (distance(vUv, vec2(0.5)) を使う)
  float power = 0.5 + 0.5 * sin(uTime) * distance(vUv, vec2(0.5));
  color = vec3(power);

  gl_FragColor = vec4(color, 1.0);
}
