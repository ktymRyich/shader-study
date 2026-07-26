// 06 用の内蔵音源 + FFT 解析。
// 外部音源ファイル不要で、ボタン一つで鳴る簡単なジェネレーティブドローンを合成する。
// (iOS/iPad の AudioContext はユーザー操作なしに再生できないため、必ずボタン経由で start する)

export function createAudioEngine() {
  let ctx = null
  let analyser = null
  let freqData = null
  let nodes = []
  let seqTimer = null

  function start() {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    freqData = new Uint8Array(analyser.frequencyBinCount)

    const master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(analyser)
    analyser.connect(ctx.destination)

    // --- 低域: ゆっくり脈打つベースドローン (55Hz) ---
    const bass = ctx.createOscillator()
    bass.type = 'sine'
    bass.frequency.value = 55
    const bassGain = ctx.createGain()
    bassGain.gain.value = 0.5
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.25
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.35
    lfo.connect(lfoGain)
    lfoGain.connect(bassGain.gain)
    bass.connect(bassGain)
    bassGain.connect(master)
    bass.start()
    lfo.start()

    // --- 中域: ペンタトニックをゆっくり歩くパッド ---
    const pad = ctx.createOscillator()
    pad.type = 'triangle'
    const padGain = ctx.createGain()
    padGain.gain.value = 0.18
    pad.connect(padGain)
    padGain.connect(master)
    pad.start()
    const scale = [220, 261.6, 293.7, 329.6, 392.0, 440]
    let step = 0
    seqTimer = setInterval(() => {
      step = (step + 1 + Math.floor(Math.random() * 2)) % scale.length
      pad.frequency.linearRampToValueAtTime(scale[step], ctx.currentTime + 0.4)
    }, 1600)

    // --- 高域: フィルタしたノイズの粒 ---
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuf
    noise.loop = true
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 5000
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.03
    const noiseLfo = ctx.createOscillator()
    noiseLfo.frequency.value = 2.0
    const noiseLfoGain = ctx.createGain()
    noiseLfoGain.gain.value = 0.025
    noiseLfo.connect(noiseLfoGain)
    noiseLfoGain.connect(noiseGain.gain)
    noise.connect(hp)
    hp.connect(noiseGain)
    noiseGain.connect(master)
    noise.start()
    noiseLfo.start()

    nodes = [bass, lfo, pad, noise, noiseLfo]
  }

  function stop() {
    if (seqTimer) clearInterval(seqTimer)
    seqTimer = null
    for (const n of nodes) { try { n.stop() } catch (e) { /* already stopped */ } }
    nodes = []
    if (ctx) ctx.close()
    ctx = null
    analyser = null
  }

  // 周波数帯を 3 バンドに集計して 0〜1 で返す
  function getBands() {
    if (!analyser) return { bass: 0, mid: 0, treble: 0 }
    analyser.getByteFrequencyData(freqData)
    const binHz = ctx.sampleRate / analyser.fftSize
    const avg = (fromHz, toHz) => {
      const from = Math.max(0, Math.floor(fromHz / binHz))
      const to = Math.min(freqData.length - 1, Math.ceil(toHz / binHz))
      let sum = 0
      for (let i = from; i <= to; i++) sum += freqData[i]
      return sum / (to - from + 1) / 255
    }
    return { bass: avg(20, 250), mid: avg(250, 2000), treble: avg(2000, 12000) }
  }

  return {
    start,
    stop,
    getBands,
    get running() { return ctx !== null },
  }
}
