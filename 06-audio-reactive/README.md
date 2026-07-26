# 06 - オーディオリアクティブ

## 目標

音楽の音量/周波数帯をシェーダーの uniform に流し込み、パーティクルや色が音に合わせて脈動するようにする (Tetris Effect / いのちめぐる冒険の設計思想の核)。

## フォーカス — 今学ぶこと / 流していいこと

**今学ぶ**
- 「音 → 数値 → uniform」のデータフロー: AnalyserNode で周波数データの配列を取り、低/中/高域に集計して uniform に送る。仕組みは 00 の uTime と完全に同じで、送る値が音になっただけ
- 生の音量値をそのまま使うと映像がガタつく、という体感と、その対策 (前フレームとの線形補間 = スムージング)。音響連動の見た目の質はほぼこれで決まる
- ビートに「吸着」させる発想 (クオンタイズ): 連続値に反応させるのと、拍のタイミングでトリガーするのは別物、という区別

**流していい**
- FFT の数学 (フーリエ変換そのもの): 「音を周波数帯ごとの強さの配列に分解してくれる」で十分
- Web Audio API のノードグラフ全般 (gain, filter, panner...): 空間音響 (PannerNode) は本番フェーズの主題なので、今は AnalyserNode だけでよい
- `fftSize` などパラメータの厳密な意味: デフォルト近辺で動かして、粗いと感じたら調べる

## 参考

- [MDN: AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- 技術選定調査メモ `D:\second-brain\wiki\projects\vr-installation\notes\2026-07-22-tech-research.md` の「空間音響」章 — レイヤー分離設計 (アンビエント層=直接ステレオ / ディテール層=HRTF) の背景

## 課題

1. `AudioContext` + `AnalyserNode` で FFT データを取得し、コンソールに出してみる
2. 低域/中域/高域の3バンドに分け、それぞれを別々の uniform (`uBass`, `uMid`, `uTreble`) として shader に渡す
3. 04 のパーティクルのスケールや色を `uBass` に連動させる
4. `AudioContext.currentTime` を使ったビートクオンタイズ (BPM 既知の曲でグリッドに合わせて何かをトリガーする) を1つ試す

## 完了したら

`07-webxr-integration/` へ。
