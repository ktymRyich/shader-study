# 05 - Raymarching / SDF

## 目標

Signed Distance Function (SDF) と raymarching を理解し、ポリゴンを使わないボリューム表現 (霧、抽象的な空間、有機的な形) を作れるようになる。「宇宙・深海のような広さ」の演出に効く。

## フォーカス — 今学ぶこと / 流していいこと

**今学ぶ**
- SDF の定義: 「その点から形の表面までの距離を返す関数 (中は負)」。球の SDF `length(p) - r` を紙に書いて納得するところから
- raymarching の基本ループ: 「レイ上を SDF の値ぶんだけ安全に進む、を繰り返す」— 20行程度のループなので、これは写経ではなく**自力で書く**
- `min` = 形の合体、`smin` = なめらかな融合、という SDF 合成の代数。有機的な形はほぼこれで作る

**流していい**
- 各種プリミティブの SDF (box, トーラス, 円柱...): Inigo Quilez のリファレンスからコピペする文化。球以外を自力導出する必要はない
- ライティングの高度な技法 (soft shadow, ambient occlusion): 作品は「霧・光の塊」方向なので、フォトリアル系の技法は必要になったときだけ
- Shadertoy 上級作品の最適化テクニック (bounding volume, LOD): 読んでも今は消化できない。プロトタイプが重くなってから戻る

## 参考

- [Michael Walczyk: Ray Marching](https://michaelwalczyk.com/blog-ray-marching.html) — raymarching の基本ループを一歩ずつ組む入門記事。まずこれ
- [Inigo Quilez: raymarching SDFs](https://iquilezles.org/articles/raymarchingdf/) — 本家による理論と実装の解説
- [Inigo Quilez の SDF 関数集](https://iquilezles.org/articles/distfunctions/) — 球・box・トーラスなどの距離関数のリファレンス。困ったらここをコピペで良い (車輪の再発明はしない)
- [Shadertoy](https://www.shadertoy.com/) — raymarching 作例の宝庫。気になる作品のコードを読んで分解するのが最良の教材

(注: The Book of Shaders には raymarching の章は存在しない — 目次に載っている後半章は未執筆のまま。ここからは上記リソースに乗り換える)

## 課題

1. 球1個の raymarching を実装する (カメラからレイを飛ばし、SDF で距離を測りながら進める基本ループ)
2. SDF 同士を `min()` (合体) / `smin()` (滑らかな合体, smooth minimum) で組み合わせ、有機的な塊を作る
3. 霧・ボリューメトリックライトっぽい効果を、レイの通過距離を使って表現する
4. 04 のパーティクルと組み合わせて、パーティクルの向こうにうっすら光るボリュームがある、といった重ね合わせを試す

## 完了したら

`06-audio-reactive/` へ。
