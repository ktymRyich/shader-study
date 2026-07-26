import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { PRESETS_3D } from './presets3d.js'

const canvas = document.getElementById('glcanvas')
const editor = document.getElementById('editor')
const gutter = document.getElementById('gutter')
const errorBox = document.getElementById('error-box')
const statusEl = document.getElementById('status')
const presetSelect = document.getElementById('preset-select')
const resetBtn = document.getElementById('reset-btn')
const tabVertex = document.getElementById('tab-vertex')
const tabFragment = document.getElementById('tab-fragment')

const STORAGE_PREFIX = 'shader-playground3d:'

// ---- three.js セットアップ ----

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
camera.position.set(0, -2.2, 1.6)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const uniforms = {
  uTime: { value: 0 },
}

// ジオメトリ: 分割済み平面 (mesh 用) と点群グリッド (points 用)。
// aRandom (頂点ごとの乱数) を両方に付与してある — 03 の attribute 課題用
function buildGeometry(segments) {
  const geo = new THREE.PlaneGeometry(2, 2, segments, segments)
  const count = geo.attributes.position.count
  const randoms = new Float32Array(count)
  for (let i = 0; i < count; i++) randoms[i] = Math.random()
  geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
  return geo
}

const meshGeometry = buildGeometry(128)
const pointsGeometry = buildGeometry(200)

const meshMaterial = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms })
const pointsMaterial = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  blending: THREE.AdditiveBlending, // 加算合成: 粒が重なると光る (04 README の定石)
  depthWrite: false,
})

const mesh = new THREE.Mesh(meshGeometry, meshMaterial)
const points = new THREE.Points(pointsGeometry, pointsMaterial)
scene.add(mesh, points)

let activeObject = mesh

// ---- シェーダー適用とエラー表示 ----

// three.js は自前のコード (uniform 宣言など) をユーザーコードの前に差し込むため、
// エラーの行番号がずれる。マーカー行を挟んで差分を計算し、エディタの行番号に直す。
const MARKER = '// __USER_CODE_START__'

let lastGood = { vertex: '', fragment: '' }

renderer.debug.onShaderError = (gl, program, vs, fs) => {
  const logs = []
  for (const shader of [vs, fs]) {
    const log = gl.getShaderInfoLog(shader)
    if (!log || !log.trim()) continue
    const source = gl.getShaderSource(shader)
    const offset = source.split('\n').findIndex((l) => l.includes(MARKER)) + 1
    const label = gl.getShaderParameter(shader, gl.SHADER_TYPE) === gl.VERTEX_SHADER ? 'vertex' : 'fragment'
    const fixed = log.replace(/ERROR: 0:(\d+):/g, (m, n) => `ERROR: ${label} ${Number(n) - offset} 行目:`)
    logs.push(fixed)
  }
  statusEl.textContent = 'コンパイルエラー'
  statusEl.classList.add('error')
  errorBox.textContent = logs.join('\n').replace(new RegExp(String.fromCharCode(0), 'g'), '').trim() || 'コンパイルエラー (詳細不明)'
  errorBox.style.display = 'block'
  // 直前に動いていたシェーダーに戻す
  applyShaders(lastGood.vertex, lastGood.fragment, { silent: true })
}

function applyShaders(vertexSrc, fragmentSrc, opts) {
  const material = activeObject.material
  material.vertexShader = MARKER + '\n' + vertexSrc
  material.fragmentShader = MARKER + '\n' + fragmentSrc
  material.needsUpdate = true
  if (!opts || !opts.silent) {
    statusEl.textContent = 'OK'
    statusEl.classList.remove('error')
    errorBox.style.display = 'none'
    // 描画が 1 フレーム走ってエラーが出なければ lastGood を更新する
    pendingGood = { vertex: vertexSrc, fragment: fragmentSrc }
  }
}

let pendingGood = null

// ---- 描画ループ ----

const clock = new THREE.Clock()

function resize() {
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
}

function tick() {
  resize()
  controls.update()
  uniforms.uTime.value = clock.getElapsedTime()
  renderer.render(scene, camera)
  if (pendingGood && !statusEl.classList.contains('error')) {
    lastGood = pendingGood
    pendingGood = null
  }
  requestAnimationFrame(tick)
}

// ---- エディタ (vertex / fragment のタブ切替) ----

let currentPresetId = PRESETS_3D[0].id
let currentStage = 'vertex' // 'vertex' | 'fragment'
let compileTimer = null

const storageKey = (id, stage) => STORAGE_PREFIX + id + ':' + stage

function currentSources() {
  const preset = PRESETS_3D.find((p) => p.id === currentPresetId)
  return {
    vertex: localStorage.getItem(storageKey(currentPresetId, 'vertex')) ?? preset.vertex.trimStart(),
    fragment: localStorage.getItem(storageKey(currentPresetId, 'fragment')) ?? preset.fragment.trimStart(),
  }
}

function loadPreset(id) {
  currentPresetId = id
  const preset = PRESETS_3D.find((p) => p.id === id)
  mesh.visible = preset.mode === 'mesh'
  points.visible = preset.mode === 'points'
  activeObject = preset.mode === 'mesh' ? mesh : points
  const src = currentSources()
  applyShaders(src.vertex, src.fragment)
  lastGood = { vertex: src.vertex, fragment: src.fragment }
  showStage(currentStage)
}

function showStage(stage) {
  currentStage = stage
  tabVertex.classList.toggle('active', stage === 'vertex')
  tabFragment.classList.toggle('active', stage === 'fragment')
  editor.value = currentSources()[stage]
  updateGutter()
}

function updateGutter() {
  const lines = editor.value.split('\n').length
  let text = ''
  for (let i = 1; i <= lines; i++) text += i + '\n'
  gutter.textContent = text
  gutter.scrollTop = editor.scrollTop
}

editor.addEventListener('input', () => {
  updateGutter()
  localStorage.setItem(storageKey(currentPresetId, currentStage), editor.value)
  clearTimeout(compileTimer)
  compileTimer = setTimeout(() => {
    const src = currentSources()
    applyShaders(src.vertex, src.fragment)
  }, 300)
})

editor.addEventListener('scroll', () => {
  gutter.scrollTop = editor.scrollTop
})

editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const { selectionStart, selectionEnd, value } = editor
    editor.value = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd)
    editor.selectionStart = editor.selectionEnd = selectionStart + 2
    editor.dispatchEvent(new Event('input'))
  }
})

tabVertex.addEventListener('click', () => showStage('vertex'))
tabFragment.addEventListener('click', () => showStage('fragment'))

// ---- プリセット UI ----

for (const preset of PRESETS_3D) {
  const opt = document.createElement('option')
  opt.value = preset.id
  opt.textContent = preset.label
  presetSelect.appendChild(opt)
}

presetSelect.addEventListener('change', () => {
  localStorage.setItem(STORAGE_PREFIX + 'last', presetSelect.value)
  loadPreset(presetSelect.value)
})

resetBtn.addEventListener('click', () => {
  if (!confirm('このプリセットの編集内容 (vertex / fragment 両方) を破棄して初期状態に戻しますか？')) return
  localStorage.removeItem(storageKey(currentPresetId, 'vertex'))
  localStorage.removeItem(storageKey(currentPresetId, 'fragment'))
  loadPreset(currentPresetId)
})

const lastPreset = localStorage.getItem(STORAGE_PREFIX + 'last')
if (lastPreset && PRESETS_3D.some((p) => p.id === lastPreset)) {
  presetSelect.value = lastPreset
}

loadPreset(presetSelect.value)
tick()
