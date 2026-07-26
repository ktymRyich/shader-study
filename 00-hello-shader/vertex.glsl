// ★今理解する: uv (0〜1 の平面座標) を varying 経由で fragment shader に渡している。
// varying = 頂点シェーダー → フラグメントシェーダーへの受け渡し変数 (頂点間は自動補間される)。
varying vec2 vUv;

void main() {
  vUv = uv;

  // 〔おまじない〕: 「3D空間の頂点位置を画面座標に変換する」定型行。
  // 行列の意味は 03 (頂点変位) で学ぶ。それまで全モジュールでこのままコピーしてよい。
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
