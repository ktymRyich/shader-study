import * as THREE from 'three'
// ★今理解する: .glsl ファイルをただの「文字列」として読み込んでいる。
// シェーダーとは結局、GPU に渡すプログラムのソースコード文字列。
import fragmentShader from './fragment.glsl?raw'
import vertexShader from './vertex.glsl?raw'

// ---- ここから〔おまじない〕: three.js の定型セットアップ。03 で正面から学ぶので今は流してよい ----
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)
// ---- 〔おまじない〕ここまで ----

// ★今理解する (1/3): uniforms = JS から GPU へ値を送る唯一の窓口。
// この uTime を毎フレーム書き換えると、fragment.glsl の `uniform float uTime` に届く。
const uniforms = {
  uTime: { value: 0 }
}

// ★今理解する (2/3): ShaderMaterial = マテリアルの見た目計算を自作シェーダーに差し替える宣言。
// vertexShader (頂点ごとに実行) と fragmentShader (ピクセルごとに実行) の2つで1セット。
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms
})

// 〔おまじない〕: シェーダーを貼るためのただの板。
const geometry = new THREE.PlaneGeometry(1.6, 1.6)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const clock = new THREE.Clock()

// ★今理解する (3/3): 毎フレーム uTime を更新 → 描画、を繰り返している。
// fragment.glsl は「全ピクセルが同時に同じプログラムを実行し、自分の座標 (vUv) だけが違う」
// という並列実行モデル。ここが CPU 的な for ループ発想との最大の違い。
function tick() {
  uniforms.uTime.value = clock.getElapsedTime()
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()

// 〔おまじない〕: ウィンドウリサイズ対応の定型文。
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
