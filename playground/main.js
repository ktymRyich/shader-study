import { PRESETS } from './presets.js'
import { BASICS, FUNCTIONS, EXTERNAL_LINKS } from './reference.js'
import { createAudioEngine } from './audio.js'

const canvas = document.getElementById('glcanvas')
const editor = document.getElementById('editor')
const gutter = document.getElementById('gutter')
const errorBox = document.getElementById('error-box')
const statusEl = document.getElementById('status')
const presetSelect = document.getElementById('preset-select')
const resetBtn = document.getElementById('reset-btn')

const STORAGE_PREFIX = 'shader-playground:'

// ---- WebGL セットアップ (フルスクリーン三角形 + ユーザーの fragment shader) ----

const gl = canvas.getContext('webgl', { antialias: false })
if (!gl) {
  errorBox.textContent = 'WebGL が使えない環境です'
  errorBox.style.display = 'block'
  throw new Error('no webgl')
}

const VERTEX_SRC = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

// 画面を覆う 1 枚の大きな三角形 (クリップ空間そのまま、行列変換なし)
const quadBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

const vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, VERTEX_SRC)
gl.compileShader(vertexShader)

let program = null
let uniformLoc = { uTime: null, uResolution: null, uMouse: null }

function compile(fragmentSrc) {
  const fs = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fs, fragmentSrc)
  gl.compileShader(fs)
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(fs)
    gl.deleteShader(fs)
    return { ok: false, log }
  }
  const prog = gl.createProgram()
  gl.attachShader(prog, vertexShader)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog)
    gl.deleteProgram(prog)
    return { ok: false, log }
  }
  return { ok: true, prog }
}

function useProgram(prog) {
  if (program) gl.deleteProgram(program)
  program = prog
  gl.useProgram(program)
  const posLoc = gl.getAttribLocation(program, 'position')
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
  uniformLoc = {
    uTime: gl.getUniformLocation(program, 'uTime'),
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uMouse: gl.getUniformLocation(program, 'uMouse'),
    uBass: gl.getUniformLocation(program, 'uBass'),
    uMid: gl.getUniformLocation(program, 'uMid'),
    uTreble: gl.getUniformLocation(program, 'uTreble'),
  }
}

function applySource(src) {
  const result = compile(src)
  if (result.ok) {
    useProgram(result.prog)
    statusEl.textContent = 'OK'
    statusEl.classList.remove('error')
    errorBox.style.display = 'none'
  } else {
    // 直前に動いていたプログラムは残したまま、エラーだけ表示する
    statusEl.textContent = 'コンパイルエラー'
    statusEl.classList.add('error')
    errorBox.textContent = formatErrors(result.log)
    errorBox.style.display = 'block'
  }
}

// "ERROR: 0:12: ..." の 12 がエディタの行番号にそのまま対応する
function formatErrors(log) {
  // ドライバによってはログ末尾に null 文字が混ざるので除去する
  return (log || '不明なエラー').replace(new RegExp(String.fromCharCode(0), 'g'), '').trim()
}

// ---- 描画ループ ----

const mouse = { x: 0.5, y: 0.5 }
const startTime = performance.now()

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.floor(canvas.clientWidth * dpr)
  const h = Math.floor(canvas.clientHeight * dpr)
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
  }
}

// 音量値は生のまま使うとガタつくので、前フレームとの線形補間でスムージングする (06 README 参照)
const bands = { bass: 0, mid: 0, treble: 0 }

function tick() {
  resize()
  if (audio.running) {
    const raw = audio.getBands()
    bands.bass += (raw.bass - bands.bass) * 0.15
    bands.mid += (raw.mid - bands.mid) * 0.15
    bands.treble += (raw.treble - bands.treble) * 0.15
  }
  if (program) {
    const t = (performance.now() - startTime) / 1000
    if (uniformLoc.uTime) gl.uniform1f(uniformLoc.uTime, t)
    if (uniformLoc.uResolution) gl.uniform2f(uniformLoc.uResolution, canvas.width, canvas.height)
    if (uniformLoc.uMouse) gl.uniform2f(uniformLoc.uMouse, mouse.x, mouse.y)
    if (uniformLoc.uBass) gl.uniform1f(uniformLoc.uBass, bands.bass)
    if (uniformLoc.uMid) gl.uniform1f(uniformLoc.uMid, bands.mid)
    if (uniformLoc.uTreble) gl.uniform1f(uniformLoc.uTreble, bands.treble)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  requestAnimationFrame(tick)
}

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect()
  mouse.x = (e.clientX - rect.left) / rect.width
  mouse.y = 1 - (e.clientY - rect.top) / rect.height // GLSL は左下原点
})
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId)
})

// ---- エディタ ----

let currentPresetId = PRESETS[0].id
let compileTimer = null

function storageKey(id) {
  return STORAGE_PREFIX + id
}

function loadPreset(id) {
  currentPresetId = id
  const preset = PRESETS.find((p) => p.id === id)
  const saved = localStorage.getItem(storageKey(id))
  editor.value = saved !== null ? saved : preset.code.trimStart()
  updateGutter()
  applySource(editor.value)
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
  localStorage.setItem(storageKey(currentPresetId), editor.value)
  clearTimeout(compileTimer)
  compileTimer = setTimeout(() => applySource(editor.value), 300)
})

editor.addEventListener('scroll', () => {
  gutter.scrollTop = editor.scrollTop
})

// Tab キー (iPad の外付けキーボード含む) でスペース 2 個を挿入
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const { selectionStart, selectionEnd, value } = editor
    editor.value = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd)
    editor.selectionStart = editor.selectionEnd = selectionStart + 2
    editor.dispatchEvent(new Event('input'))
  }
})

// ---- プリセット UI ----

for (const preset of PRESETS) {
  const opt = document.createElement('option')
  opt.value = preset.id
  opt.textContent = preset.label
  presetSelect.appendChild(opt)
}

presetSelect.addEventListener('change', () => loadPreset(presetSelect.value))

resetBtn.addEventListener('click', () => {
  if (!confirm('このプリセットの編集内容を破棄して初期状態に戻しますか？')) return
  localStorage.removeItem(storageKey(currentPresetId))
  loadPreset(currentPresetId)
})

// 前回開いていたプリセットを復元
const lastPreset = localStorage.getItem(STORAGE_PREFIX + 'last')
if (lastPreset && PRESETS.some((p) => p.id === lastPreset)) {
  presetSelect.value = lastPreset
}
presetSelect.addEventListener('change', () => {
  localStorage.setItem(STORAGE_PREFIX + 'last', presetSelect.value)
})

// ---- 音 (06 オーディオリアクティブ用) ----

const audio = createAudioEngine()
const audioBtn = document.getElementById('audio-btn')

audioBtn.addEventListener('click', () => {
  if (audio.running) {
    audio.stop()
    bands.bass = bands.mid = bands.treble = 0
    audioBtn.textContent = '♪ 音 OFF'
    audioBtn.setAttribute('aria-pressed', 'false')
  } else {
    audio.start() // iPad はユーザー操作 (このクリック) の中でしか AudioContext を開始できない
    audioBtn.textContent = '♪ 音 ON'
    audioBtn.setAttribute('aria-pressed', 'true')
  }
})

// ---- 関数リファレンスパネル ----

const refPanel = document.getElementById('ref-panel')
const refBtn = document.getElementById('ref-btn')
const refClose = document.getElementById('ref-close')
const refSearch = document.getElementById('ref-search')
const refList = document.getElementById('ref-list')

function renderReference(query) {
  const q = (query || '').trim().toLowerCase()
  refList.textContent = ''

  const matches = (...fields) => !q || fields.some((f) => f.toLowerCase().includes(q))

  // 前提・記法 (検索中は該当するものだけ)
  const basics = BASICS.filter((b) => matches(b.title, b.body))
  if (basics.length) {
    const h = document.createElement('h3')
    h.textContent = '前提・記法'
    refList.appendChild(h)
    for (const b of basics) {
      const item = document.createElement('div')
      item.className = 'ref-item'
      const title = document.createElement('p')
      title.className = 'basics-title'
      title.textContent = b.title
      const body = document.createElement('p')
      body.textContent = b.body
      item.append(title, body)
      refList.appendChild(item)
    }
  }

  // 関数 (カテゴリごと)
  const funcs = FUNCTIONS.filter((f) => matches(f.name, f.sig, f.desc, f.cat))
  const cats = [...new Set(funcs.map((f) => f.cat))]
  for (const cat of cats) {
    const h = document.createElement('h3')
    h.textContent = cat
    refList.appendChild(h)
    for (const f of funcs.filter((x) => x.cat === cat)) {
      const item = document.createElement('div')
      item.className = 'ref-item'
      const sig = document.createElement('code')
      sig.textContent = f.sig
      const desc = document.createElement('p')
      desc.textContent = f.desc
      item.append(sig, desc)
      refList.appendChild(item)
    }
  }

  if (!basics.length && !funcs.length) {
    const p = document.createElement('p')
    p.style.color = 'var(--dim)'
    p.style.fontSize = '13px'
    p.textContent = '該当なし'
    refList.appendChild(p)
  }

  // 外部リンク (検索していないときだけ)
  if (!q) {
    const h = document.createElement('h3')
    h.textContent = 'もっと詳しく (外部サイト)'
    refList.appendChild(h)
    for (const link of EXTERNAL_LINKS) {
      const a = document.createElement('a')
      a.href = link.url
      a.target = '_blank'
      a.rel = 'noreferrer'
      a.textContent = link.label
      refList.appendChild(a)
    }
  }
}

refBtn.addEventListener('click', () => {
  refPanel.classList.add('open')
  renderReference(refSearch.value)
})
refClose.addEventListener('click', () => refPanel.classList.remove('open'))
refSearch.addEventListener('input', () => renderReference(refSearch.value))

loadPreset(presetSelect.value)
tick()
