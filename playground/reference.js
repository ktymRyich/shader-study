// GLSL (ES 1.0 = WebGL1) 組み込み関数リファレンス。
// 表記ルール: genType = float / vec2 / vec3 / vec4 のどれでも可 (成分ごとに適用される)

export const BASICS = [
  {
    title: 'swizzle (成分アクセス)',
    body: 'vec の成分は .x .y .z .w でも .r .g .b .a でも取れる。完全に同じもので、座標として見るか色として見るかの気分の違いだけ。組み合わせ・並べ替えも可: v.xy (先頭2成分), v.rgb (3成分), v.yx (入れ替え), v.xxx (同じ成分を3回)',
  },
  {
    title: 'コンストラクタの省略',
    body: 'vec3(1.0) は vec3(1.0, 1.0, 1.0) と同じ。vec4(color, 1.0) のように vec3 + float から vec4 も作れる',
  },
  {
    title: 'float には必ず小数点',
    body: 'GLSL では 1 と 1.0 は別の型 (int と float)。float の計算には必ず小数点を付ける (1.0, 0.5)。int と float の混在はコンパイルエラーになる',
  },
  {
    title: 'genType とは',
    body: 'このリストでの genType は「float / vec2 / vec3 / vec4 のどれでも可」の意味。vec を渡すと成分ごとに適用される (例: abs(vec2(-1.0, 2.0)) → vec2(1.0, 2.0))',
  },
  {
    title: 'この Playground で使える変数',
    body: 'vUv (vec2, 0〜1 の画面座標・左下原点) / uTime (float, 経過秒) / uResolution (vec2, 画面ピクセル) / uMouse (vec2, 0〜1) / uBass, uMid, uTreble (float, ♪ 音 ON のとき各帯域の音量 0〜1) / gl_FragColor (vec4, 出力する色。最後に必ず代入する)',
  },
]

export const FUNCTIONS = [
  // --- パターン作りの主役 ---
  { name: 'mix', sig: 'genType mix(genType a, genType b, genType t)', cat: '主役',
    desc: '線形補間。t=0.0 で a、t=1.0 で b、中間はブレンド。2色のグラデーションの基本' },
  { name: 'step', sig: 'genType step(genType edge, genType x)', cat: '主役',
    desc: 'x < edge なら 0.0、それ以上なら 1.0。パキッとした境界 (くっきりした円や縞)' },
  { name: 'smoothstep', sig: 'genType smoothstep(genType e0, genType e1, genType x)', cat: '主役',
    desc: 'x が e0〜e1 の間でなめらかに 0→1。step のボケ足つき版。アンチエイリアスの基本' },
  { name: 'fract', sig: 'genType fract(genType x)', cat: '主役',
    desc: '小数部分だけ返す (x - floor(x))。fract(uv * 4.0) で画面をタイル状に繰り返すのが定番' },
  { name: 'clamp', sig: 'genType clamp(genType x, genType minVal, genType maxVal)', cat: '主役',
    desc: 'x を min〜max の範囲に収める。はみ出た値の暴れ防止' },
  { name: 'distance', sig: 'float distance(genType a, genType b)', cat: '主役',
    desc: '2点間の距離。distance(vUv, vec2(0.5)) で「中心からの距離」→ 円が描ける' },
  { name: 'length', sig: 'float length(genType v)', cat: '主役',
    desc: 'ベクトルの長さ。length(p) - r は球/円の SDF そのもの' },

  // --- 数学 (共通) ---
  { name: 'abs', sig: 'genType abs(genType x)', cat: '数学',
    desc: '絶対値。左右対称な模様を作るときにも使う (abs(uv.x - 0.5))' },
  { name: 'sign', sig: 'genType sign(genType x)', cat: '数学',
    desc: '符号を返す (-1.0 / 0.0 / 1.0)' },
  { name: 'floor', sig: 'genType floor(genType x)', cat: '数学',
    desc: '切り捨て。floor(uv * 4.0) で「何番目のタイルか」の ID が取れる' },
  { name: 'ceil', sig: 'genType ceil(genType x)', cat: '数学',
    desc: '切り上げ' },
  { name: 'mod', sig: 'genType mod(genType x, genType y)', cat: '数学',
    desc: 'x を y で割った余り。繰り返し・ストライプに' },
  { name: 'min', sig: 'genType min(genType x, genType y)', cat: '数学',
    desc: '小さい方を返す。SDF の世界では「形の合体」の意味になる' },
  { name: 'max', sig: 'genType max(genType x, genType y)', cat: '数学',
    desc: '大きい方を返す。max(x, 0.0) で負の値を切るのが頻出 (ライティングなど)' },
  { name: 'pow', sig: 'genType pow(genType x, genType y)', cat: '数学',
    desc: 'x の y 乗。0〜1 の値のコントラスト調整によく使う (pow(n, 2.0) で暗部を締める)' },
  { name: 'sqrt', sig: 'genType sqrt(genType x)', cat: '数学',
    desc: '平方根' },
  { name: 'inversesqrt', sig: 'genType inversesqrt(genType x)', cat: '数学',
    desc: '1.0 / sqrt(x)。normalize の中身で使われている高速版' },
  { name: 'exp', sig: 'genType exp(genType x)', cat: '数学',
    desc: 'e の x 乗。距離減衰 (フォグ) に exp(-d * k) の形でよく登場' },
  { name: 'log', sig: 'genType log(genType x)', cat: '数学',
    desc: '自然対数' },
  { name: 'exp2', sig: 'genType exp2(genType x)', cat: '数学',
    desc: '2 の x 乗' },
  { name: 'log2', sig: 'genType log2(genType x)', cat: '数学',
    desc: '底 2 の対数' },

  // --- 三角関数・角度 ---
  { name: 'sin', sig: 'genType sin(genType x)', cat: '三角関数',
    desc: '-1〜1 の波。0.5 + 0.5 * sin(x) で 0〜1 に写すのがイディオム。時間アニメの基本' },
  { name: 'cos', sig: 'genType cos(genType x)', cat: '三角関数',
    desc: 'sin の 90° ずれ版。(cos(a), sin(a)) で円運動' },
  { name: 'tan', sig: 'genType tan(genType x)', cat: '三角関数',
    desc: '正接' },
  { name: 'atan', sig: 'float atan(float y, float x)', cat: '三角関数',
    desc: '点 (x, y) の角度 (-π〜π)。uv を「中心からの角度」に変換 → 放射状・回転模様の必須関数' },
  { name: 'asin', sig: 'genType asin(genType x)', cat: '三角関数',
    desc: '逆正弦' },
  { name: 'acos', sig: 'genType acos(genType x)', cat: '三角関数',
    desc: '逆余弦' },
  { name: 'radians', sig: 'genType radians(genType deg)', cat: '三角関数',
    desc: '度 → ラジアン変換。GLSL の角度は全部ラジアン' },
  { name: 'degrees', sig: 'genType degrees(genType rad)', cat: '三角関数',
    desc: 'ラジアン → 度変換' },

  // --- ベクトル幾何 ---
  { name: 'dot', sig: 'float dot(genType a, genType b)', cat: 'ベクトル',
    desc: '内積。「2つの向きがどれだけ一致しているか」。ライティング (法線・光方向) の主役' },
  { name: 'cross', sig: 'vec3 cross(vec3 a, vec3 b)', cat: 'ベクトル',
    desc: '外積 (vec3 専用)。2つのベクトル両方に垂直なベクトルを返す。法線の計算に' },
  { name: 'normalize', sig: 'genType normalize(genType v)', cat: 'ベクトル',
    desc: '長さを 1 に揃える。方向だけ欲しいとき (レイの方向、法線) は必ず通す' },
  { name: 'reflect', sig: 'genType reflect(genType I, genType N)', cat: 'ベクトル',
    desc: '入射ベクトル I を法線 N で反射させたベクトル。鏡面反射に' },
  { name: 'refract', sig: 'genType refract(genType I, genType N, float eta)', cat: 'ベクトル',
    desc: '屈折ベクトル。eta は屈折率の比。水・ガラス表現に' },
  { name: 'faceforward', sig: 'genType faceforward(genType N, genType I, genType Nref)', cat: 'ベクトル',
    desc: '法線を視線に向き直す。両面描画の裏面対策' },

  // --- テクスチャ ---
  { name: 'texture2D', sig: 'vec4 texture2D(sampler2D tex, vec2 uv)', cat: 'テクスチャ',
    desc: 'テクスチャの uv 位置の色を読む。GPGPU では「データの読み出し」の意味になる (04 で使う)' },
]

export const EXTERNAL_LINKS = [
  { label: 'The Book of Shaders — Glossary (英語)', url: 'https://thebookofshaders.com/glossary/' },
  { label: 'WebGL 1.0 Reference Card (PDF, 公式チートシート)', url: 'https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf' },
  { label: 'docs.gl — GLSL リファレンス (英語)', url: 'https://docs.gl/' },
]
