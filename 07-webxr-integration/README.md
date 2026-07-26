# 07 - WebXR 統合・実機確認

## 目標

Quest 3 の実機で、これまでのモジュールの成果物を VR 空間で確認する。ここでの手触りが、Phase 2 (UE) でのパフォーマンス予算感覚の基準になる。

## フォーカス — 今学ぶこと / 流していいこと

**今学ぶ**
- three.js を XR 対応にする差分は実質3行 (`renderer.xr.enabled = true`、`VRButton`、`setAnimationLoop`) だと知ること。シェーダー側は一切変更不要
- VR 特有のパフォーマンス感覚: 両目で2回描画される・フレーム落ちが即酔いに直結する・「PC 画面では 60fps 余裕」が実機でどう変わるか。**この体感を数値で記録するのが本モジュールの成果物**
- スケール感の体感: 画面で見るパーティクルと VR 内で見るパーティクルは、サイズ・密度・速度の「気持ちよさ」が全く違う。ここで得た感覚が UE での作品制作の基準になる

**流していい**
- WebXR API の仕様詳細 (XRSession, reference space の種類...): three.js が隠蔽してくれる。Phase 2 は UE なので、この層の知識は持ち越さない
- コントローラ入力・ハンドトラッキング: インスタレーション作品には当面不要
- Link / Air Link の仕組みの深掘り: 「PC の映像をヘッドセットに送る配管」でよい。繋がらないときだけトラブルシュートする

## 参考

- [MDN: WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- three.js の [WebXR examples](https://threejs.org/examples/?q=webxr)
- Quest 3 は Link ケーブル or Air Link で PC に接続し、Chrome/Edge の WebXR が OpenXR 経由でランタイムに繋がる。Meta Quest Link アプリの設定で OpenXR ランタイムを Meta に設定しておくこと (Rift S 時代の調査メモがそのまま使える: `D:\second-brain\wiki\projects\vr-installation\notes\2026-07-22-tech-research.md`)
- `VRButton` は `three/addons/webxr/VRButton.js` から import する。`renderer.xr.enabled = true` と、`requestAnimationFrame` の代わりに `renderer.setAnimationLoop(tick)` を使う点が通常の three.js と違う (XR ではブラウザでなくヘッドセットの表示ループに同期する必要があるため)

## 課題

1. 「Hello WebXR」: three.js の `VRButton` を使い、空のシーンに立方体を置くだけのものを Quest 3 実機で表示確認する
2. 04 の GPGPU パーティクルシーンを WebXR 対応にし、実機でフレームレートを確認する (ブラウザの XR 統計 or `renderer.xr` 経由で FPS を出す)
3. Quest 3 PCVR でのパーティクル数の上限を実測し、`STUDY_GUIDE.md` の「Phase 2 へのメモ欄」に記録する (UE 側での目標値の参考になる)

## 完了したら

Phase 1 は一通り完了。`STUDY_GUIDE.md` の「Phase 2 (UE移行) へのメモ欄」を見返し、`wiki/projects/vr-installation/vr-installation.md` の進捗を更新してから、Phase 2 (Unreal Engine) の計画に進む。
