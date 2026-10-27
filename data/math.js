'use strict';
/* ---------- 共通ユーティリティ ---------- */
const $ = (s, r = document) => r.querySelector(s);
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[ri(0, a.length - 1)];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 10^scale 倍した整数 n を小数の文字列にする（末尾の0は消す）
function fmt(n, scale) {
  if (scale === 0) return String(n);
  const neg = n < 0;
  const s = String(Math.abs(n)).padStart(scale + 1, '0');
  const i = s.slice(0, -scale), f = s.slice(-scale).replace(/0+$/, '');
  return (neg ? '-' : '') + i + (f ? '.' + f : '');
}
const FR = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
const MX = (w, n, d) => `<span class="mx">${w}</span>${FR(n, d)}`;
const sum = a => a.reduce((x, y) => x + y, 0);
// 小数（0.1けた）で 10の倍数でない 12〜hi の整数
function dt(lo = 12, hi = 99) { let a; do { a = ri(lo, hi); } while (a % 10 === 0); return a; }

/* ---------- 図（SVG） ---------- */
const svgWrap = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;height:auto" role="img" aria-label="問題の図" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round" font-family="Yu Gothic UI,Meiryo,sans-serif" font-size="15">${inner}</g></svg>`;
const T = (x, y, s, a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}" fill="currentColor" stroke="none">${s}</text>`;
const DASH = 'stroke-dasharray="5 4"';
// 直方体：よこ=front横, たて=奥行き, 高さ。値は文字列（? も可）
function figCuboid(yoko, tate, taka) {
  return svgWrap(340, 160,
    `<g transform="translate(70,0)"><polygon points="30,60 160,60 160,130 30,130" fill="#eef3fb"/>` +
    `<polygon points="30,60 160,60 205,30 75,30" fill="#f7faff"/>` +
    `<polygon points="160,60 205,30 205,100 160,130" fill="#dfe8f5"/>` +
    T(95, 150, `よこ ${yoko}`) + T(22, 100, `高さ ${taka}`, 'end') + T(210, 26, `たて ${tate}`, 'start') + `</g>`);
}
function figCube(a) {
  return svgWrap(250, 170,
    `<polygon points="40,70 130,70 130,150 40,150" fill="#eef3fb"/>` +
    `<polygon points="40,70 130,70 175,40 85,40" fill="#f7faff"/>` +
    `<polygon points="130,70 175,40 175,120 130,150" fill="#dfe8f5"/>` +
    T(85, 166, a) + T(32, 115, a, 'end') + T(160, 36, a, 'start'));
}
function figPara(b, h) {
  return svgWrap(300, 150,
    `<polygon points="40,110 190,110 230,40 80,40" fill="#eef3fb"/>` +
    `<line x1="80" y1="40" x2="80" y2="110" ${DASH}/><polyline points="80,100 90,100 90,110"/>` +
    T(115, 134, `底辺 ${b}`) + T(90, 82, `高さ ${h}`, 'start'));
}
function figTri(b, h) {
  return svgWrap(300, 150,
    `<polygon points="40,110 230,110 150,35" fill="#eef3fb"/>` +
    `<line x1="150" y1="35" x2="150" y2="110" ${DASH}/><polyline points="150,100 160,100 160,110"/>` +
    T(135, 134, `底辺 ${b}`) + T(142, 98, `高さ ${h}`, 'end'));
}
function figTrap(a, b, h) {
  return svgWrap(300, 160,
    `<polygon points="40,115 250,115 200,40 90,40" fill="#eef3fb"/>` +
    `<line x1="90" y1="40" x2="90" y2="115" ${DASH}/><polyline points="90,105 100,105 100,115"/>` +
    T(145, 30, `上底 ${a}`) + T(145, 140, `下底 ${b}`) + T(98, 82, `高さ ${h}`, 'start'));
}
function figRhombus(p, q) {
  return svgWrap(300, 160,
    `<polygon points="150,15 250,80 150,145 50,80" fill="#eef3fb"/>` +
    `<line x1="150" y1="15" x2="150" y2="145" ${DASH}/><line x1="50" y1="80" x2="250" y2="80" ${DASH}/>` +
    T(158, 52, p, 'start') + T(212, 74, q, 'middle'));
}

/* ---------- 算数：類題ジェネレーター ---------- */
const num = (html, ans, unit, explain, key, fig) => ({ kind: 'num', html, ans: String(ans), unit: unit || '', explain: explain || '', key, fig: fig || '' });
const frac = (html, n, d, form, show, explain, key) => ({ kind: 'frac', html, ans: { n, d }, form, show, unit: '', explain: explain || '', key });

const MATH = {
  '小数のかけ算': [
    () => { const a = dt(), n = ri(2, 9);
      return num(`${fmt(a, 1)} × ${n} =`, fmt(a * n, 1), '', `${fmt(a, 1)} は 0.1 が ${a} こ分。${a} × ${n} = ${a * n} だから ${fmt(a * n, 1)}`, 'mulDecInt'); },
    () => { const a = dt(), b = dt();
      return num(`${fmt(a, 1)} × ${fmt(b, 1)} =`, fmt(a * b, 2), '', `小数点をなくして ${a} × ${b} = ${a * b}。小数点の右がわの数の合計（2けた）だけ、右から数えて点を打つ → ${fmt(a * b, 2)}`, 'mulDecDec'); },
    () => { const A = dt(12, 59), B = dt(12, 59);
      const s = pick([
        [`1mの重さが ${fmt(A, 1)}kg の鉄のぼうがあります。この鉄のぼう ${fmt(B, 1)}m の重さは何kgですか。`, 'kg'],
        [`1Lのガソリンで ${fmt(A, 1)}km 走る車があります。${fmt(B, 1)}L のガソリンでは何km走れますか。`, 'km'],
        [`1m²のかべをぬるのに、ペンキを ${fmt(A, 1)}dL 使います。${fmt(B, 1)}m² のかべをぬるには、ペンキは何dL いりますか。`, 'dL']]);
      return num(s[0], fmt(A * B, 2), s[1], `式：${fmt(A, 1)} × ${fmt(B, 1)} = ${fmt(A * B, 2)}`, 'mulWord'); },
  ],
  '小数のわり算': [
    () => { const d = dt(12, 59), q = dt(12, 59);
      return num(`${fmt(d * q, 2)} ÷ ${fmt(d, 1)} =`, fmt(q, 1), '', `わる数を10倍して ${d}、わられる数も10倍して ${fmt(d * q, 1)}。${fmt(d * q, 1)} ÷ ${d} = ${fmt(q, 1)}`, 'divDec'); },
    () => { let d, q, t; do { d = pick([2, 4, 5, 8, 15, 25]); q = ri(3, 30); t = d * q; } while (t % 10 !== 0);
      return num(`${t / 10} ÷ ${fmt(d, 1)} =`, q, '', `わる数もわられる数も10倍して ${t} ÷ ${d} = ${q}`, 'divInt'); },
    () => { const d = dt(12, 39), q = ri(3, 12);
      return num(`${fmt(d * q, 1)}Lのジュースを、${fmt(d, 1)}Lずつびんに入れます。びんは何本できますか。`, q, '本', `式：${fmt(d * q, 1)} ÷ ${fmt(d, 1)} = ${q}`, 'divWord'); },
    () => { const y = dt(12, 59), k = dt(12, 59);
      return num(`${fmt(y * k, 2)}m は ${fmt(y, 1)}m の何倍ですか。`, fmt(k, 1), '倍', `「何倍」はわり算で求める。${fmt(y * k, 2)} ÷ ${fmt(y, 1)} ＝ ${fmt(k, 1)}`, 'divTimes'); },
    () => { let a, b, q, rem; do { a = ri(21, 99); b = ri(2, 9); q = Math.floor(a / (b * 10)); rem = a - q * b * 10; } while (q < 1 || rem === 0 || a % 10 === 0);
      return num(`${fmt(a, 1)}Lのジュースを ${b}L ずつびんに入れます。${q}本できて、あまりは何Lですか。`, fmt(rem, 1), 'L', `${fmt(a, 1)} ÷ ${b} ＝ ${q} あまり ${fmt(rem, 1)}（あまりの小数点は、わられる数にそろえてうつ）`, 'divRem'); },
  ],
  '分数': [
    () => { let a, b; do { b = ri(3, 9); a = ri(1, b - 1); } while (gcd(a, b) !== 1); const k = ri(2, 6);
      return frac(`${FR(a * k, b * k)} を約分しなさい。`, a, b, 'imp', `${a}/${b}`, `分子と分母を ${k} でわる → ${a}/${b}`, 'reduce'); },
    () => { let d, n; do { d = ri(2, 9); n = ri(d + 1, 5 * d); } while (n % d === 0 || gcd(n % d, d) !== 1);
      const w = Math.floor(n / d), r = n % d;
      return frac(`${FR(n, d)} を帯分数になおしなさい。`, n, d, 'mixed', `${w}と${r}/${d}`, `${n} ÷ ${d} = ${w} あまり ${r} → ${w}と${r}/${d}`, 'impToMixed'); },
    () => { let d, r; do { d = ri(2, 9); r = ri(1, d - 1); } while (gcd(r, d) !== 1); const w = ri(1, 5);
      return frac(`${MX(w, r, d)} を仮分数になおしなさい。`, w * d + r, d, 'imp', `${w * d + r}/${d}`, `${w} × ${d} + ${r} = ${w * d + r} → ${w * d + r}/${d}`, 'mixedToImp'); },
    () => { const D = [2, 3, 4, 5, 6, 8, 10, 12]; let b, d; do { b = pick(D); d = pick(D); } while (b === d);
      const a = ri(1, b - 1), c = ri(1, d - 1); const N = a * d + c * b, M = b * d, g = gcd(N, M);
      return fracAny(`${FR(a, b)} + ${FR(c, d)} =`, N / g, M / g, `通分して ${a * d}/${M} + ${c * b}/${M} = ${N}/${M}。約分できるときは約分する`, 'add'); },
    () => { const D = [2, 3, 4, 5, 6, 8, 10, 12]; let b, d, a, c; do { b = pick(D); d = pick(D); a = ri(1, b - 1); c = ri(1, d - 1); } while (b === d || a * d <= c * b);
      const N = a * d - c * b, M = b * d, g = gcd(N, M);
      return fracAny(`${FR(a, b)} − ${FR(c, d)} =`, N / g, M / g, `通分して ${a * d}/${M} − ${c * b}/${M} = ${N}/${M}。約分できるときは約分する`, 'sub'); },
    () => { let m, n; do { m = ri(1, 9); n = ri(2, 9); } while (m === n || gcd(m, n) !== 1);
      return fracAny(`${m} ÷ ${n} の商を、分数で表しなさい。`, m, n, `わり算の商は、わられる数を分子、わる数を分母にした分数で表せる → ${m}/${n}`, 'quotient'); },
    () => { let d, n; do { d = pick([2, 4, 5, 8, 20, 25]); n = ri(1, d - 1); } while (gcd(n, d) !== 1);
      return num(`${FR(n, d)} を小数で表しなさい。`, fmt(n * (1000 / d), 3), '', `${n} ÷ ${d} を計算する → ${fmt(n * (1000 / d), 3)}`, 'fracToDec'); },
    () => { let d, n; do { d = pick([2, 4, 5, 8, 20, 25]); n = ri(1, d - 1); } while (gcd(n, d) !== 1);
      const den = d === 8 ? 1000 : (d === 2 || d === 5) ? 10 : 100;   // 小数の桁数に合わせた分母（0.6 → 6/10、0.25 → 25/100、0.125 → 125/1000）
      return frac(`${fmt(n * (1000 / d), 3)} を分数で表しなさい（約分する）。`, n, d, 'imp', `${n}/${d}`, `${fmt(n * (1000 / d), 3)} = ${n * (den / d)}/${den} を約分して ${n}/${d}`, 'decToFrac'); },
    () => { let b, d, l; do { b = ri(2, 9); d = ri(2, 9); l = b * d / gcd(b, d); } while (b === d || l > 36);
      const a = ri(1, b - 1), c = ri(1, d - 1);
      return num(`${FR(a, b)} と ${FR(c, d)} を通分します。分母をそろえるとき、いちばん小さい共通の分母はいくつですか。`, l, '', `${b} と ${d} の最小公倍数が ${l}`, 'commonDen'); },
    () => { const d = ri(5, 12), add = Math.random() < 0.5; let a, c;
      do { a = ri(1, d - 1); c = ri(1, d - 1); } while (!add && a <= c);
      const N = add ? a + c : a - c, g = gcd(N, d);
      return fracAny(`${FR(a, d)} ${add ? '+' : '−'} ${FR(c, d)} =`, N / g, d / g, `分母は そのままで、分子どうしを計算する → ${N}/${d}。約分できるときは約分する`, 'sameDen'); },
    () => { const D = [2, 3, 4, 5, 6]; let b, d; do { b = pick(D); d = pick(D); } while (b === d);
      const w1 = ri(1, 4), w2 = ri(1, 4), a = ri(1, b - 1), c = ri(1, d - 1);
      const N = (w1 * b + a) * d + (w2 * d + c) * b, M = b * d, g = gcd(N, M);
      return fracAny(`${MX(w1, a, b)} + ${MX(w2, c, d)} =`, N / g, M / g, `どちらも仮分数にして通分して計算する。または、整数部分と分数部分に分けて計算する`, 'mixAdd'); },
  ],
  '体積': [
    () => { const a = ri(2, 12), b = ri(2, 12), c = ri(2, 12);
      return num(`たて ${a}cm、よこ ${b}cm、高さ ${c}cm の直方体の体積は何cm³ですか。`, a * b * c, 'cm³', `体積 ＝ たて × よこ × 高さ ＝ ${a} × ${b} × ${c} ＝ ${a * b * c}`, 'cuboid', figCuboid(b + 'cm', a + 'cm', c + 'cm')); },
    () => { const a = ri(2, 9);
      return num(`1辺が ${a}cm の立方体の体積は何cm³ですか。`, a ** 3, 'cm³', `${a} × ${a} × ${a} ＝ ${a ** 3}`, 'cube', figCube(a + 'cm')); },
    () => { const l = ri(3, 12), w = ri(3, 12), h = ri(2, 10), V = l * w * h;
      return num(`たて ${l}cm、よこ ${w}cm で、体積が ${V}cm³ の直方体があります。高さは何cmですか。`, h, 'cm', `高さ ＝ 体積 ÷ (たて × よこ) ＝ ${V} ÷ ${l * w} ＝ ${h}`, 'height', figCuboid(w + 'cm', l + 'cm', '？')); },
    () => { const x = ri(2, 9);
      const s = pick([
        [`${x}L は何cm³ですか。`, x * 1000, 'cm³', '1L ＝ 1000cm³'],
        [`${x}m³ は何cm³ですか。`, x * 1000000, 'cm³', '1m³ ＝ 1000000cm³（100 × 100 × 100）'],
        [`${x * 1000}cm³ は何Lですか。`, x, 'L', '1000cm³ ＝ 1L'],
        [`${x}m³ は何Lですか。`, x * 1000, 'L', '1m³ ＝ 1000L'],
        [`${x}L は何mLですか。`, x * 1000, 'mL', '1L ＝ 1000mL（1mL ＝ 1cm³）']]);
      return num(s[0], s[1], s[2], s[3], 'volUnit'); },
    () => { const a = pick([10, 20, 30, 40, 50]), b = pick([10, 20, 30, 40]), c = pick([10, 20, 30]); const V = a * b * c;
      return num(`内のりが、たて ${a}cm、よこ ${b}cm、深さ ${c}cm の水そうがあります。この水そうには、水が何Lはいりますか。`, V / 1000, 'L', `${a} × ${b} × ${c} ＝ ${V}cm³ ＝ ${V / 1000}L（1L ＝ 1000cm³）`, 'container'); },
  ],
  '面積': [
    () => { const b = ri(3, 15), h = ri(2, 12);
      return num(`底辺 ${b}cm、高さ ${h}cm の平行四辺形の面積は何cm²ですか。`, b * h, 'cm²', `平行四辺形の面積 ＝ 底辺 × 高さ ＝ ${b} × ${h}`, 'para', figPara(b + 'cm', h + 'cm')); },
    () => { let b, h; do { b = ri(3, 15); h = ri(2, 12); } while ((b * h) % 2);
      return num(`底辺 ${b}cm、高さ ${h}cm の三角形の面積は何cm²ですか。`, b * h / 2, 'cm²', `三角形の面積 ＝ 底辺 × 高さ ÷ 2 ＝ ${b} × ${h} ÷ 2`, 'tri', figTri(b + 'cm', h + 'cm')); },
    () => { let a, b, h; do { a = ri(2, 10); b = ri(a + 1, 16); h = ri(2, 10); } while (((a + b) * h) % 2);
      return num(`上底 ${a}cm、下底 ${b}cm、高さ ${h}cm の台形の面積は何cm²ですか。`, (a + b) * h / 2, 'cm²', `台形の面積 ＝ (上底 + 下底) × 高さ ÷ 2 ＝ (${a} + ${b}) × ${h} ÷ 2`, 'trap', figTrap(a + 'cm', b + 'cm', h + 'cm')); },
    () => { let p, q; do { p = ri(3, 16); q = ri(3, 16); } while ((p * q) % 2);
      return num(`対角線が ${p}cm と ${q}cm のひし形の面積は何cm²ですか。`, p * q / 2, 'cm²', `ひし形の面積 ＝ 対角線 × 対角線 ÷ 2 ＝ ${p} × ${q} ÷ 2`, 'rhombus', figRhombus(p + 'cm', q + 'cm')); },
    () => { let b, h; do { b = ri(3, 15); h = ri(2, 12); } while ((b * h) % 2);
      return num(`面積が ${b * h / 2}cm² で、底辺が ${b}cm の三角形があります。高さは何cmですか。`, h, 'cm', `高さ ＝ 面積 × 2 ÷ 底辺 ＝ ${b * h / 2} × 2 ÷ ${b} ＝ ${h}`, 'revTri', figTri(b + 'cm', '？')); },
    () => { const b = ri(3, 15), h = ri(2, 12);
      return num(`面積が ${b * h}cm² で、底辺が ${b}cm の平行四辺形があります。高さは何cmですか。`, h, 'cm', `高さ ＝ 面積 ÷ 底辺 ＝ ${b * h} ÷ ${b} ＝ ${h}`, 'revPara', figPara(b + 'cm', '？')); },
    () => { const x = ri(2, 9);
      const s = pick([
        [`${x}ha は何m²ですか。`, x * 10000, 'm²', '1ha ＝ 10000m²'],
        [`${x}km² は何ha ですか。`, x * 100, 'ha', '1km² ＝ 100ha'],
        [`${x}a は何m²ですか。`, x * 100, 'm²', '1a ＝ 100m²'],
        [`${x}km² は何m²ですか。`, x * 1000000, 'm²', '1km² ＝ 1000000m²（1000 × 1000）']]);
      return num(s[0], s[1], s[2], s[3], 'areaUnit'); },
    () => { const a = ri(3, 15), b = ri(3, 15);
      return Math.random() < 0.5
        ? num(`たて ${a}cm、よこ ${b}cm の長方形の面積は何cm²ですか。`, a * b, 'cm²', `長方形の面積 ＝ たて × よこ ＝ ${a} × ${b}`, 'rectArea')
        : num(`たて ${a}cm、よこ ${b}cm の長方形の、まわりの長さは何cmですか。`, 2 * (a + b), 'cm', `(たて + よこ) × 2 ＝ (${a} + ${b}) × 2`, 'rectPerim'); },
    () => { const a = ri(8, 15), b = ri(8, 15), c = ri(2, a - 3), d = ri(2, b - 3);
      return num(`たて ${a}cm、よこ ${b}cm の長方形の紙から、すみの、たて ${c}cm、よこ ${d}cm の長方形を切り取りました。のこりの面積は何cm²ですか。`, a * b - c * d, 'cm²', `大きい長方形の面積 − 切り取った長方形の面積 ＝ ${a} × ${b} − ${c} × ${d}`, 'areaLshape'); },
  ],
  '平均': [
    () => { let n, m, offs, last; do { n = ri(3, 6); m = ri(40, 95); offs = []; for (let i = 0; i < n - 1; i++) offs.push(ri(-12, 12)); last = -sum(offs); } while (Math.abs(last) > 25);
      const vals = shuffle(offs.concat(last).map(o => m + o));
      return num(`次の ${n} つの数の平均を求めなさい。<br>${vals.join('、')}`, m, '', `合計 ${sum(vals)} ÷ ${n} ＝ ${m}`, 'meanVals'); },
    () => { const m = ri(12, 45), d = ri(3, 9);
      return num(`1日に平均 ${m} ページずつ本を読みます。${d}日間では、全部で何ページ読むことになりますか。`, m * d, 'ページ', `合計 ＝ 平均 × 日数 ＝ ${m} × ${d}`, 'meanTotal'); },
    () => { let n, a, b, need; do { n = ri(3, 5); a = ri(70, 85); b = a + ri(1, 4); need = b * (n + 1) - a * n; } while (need > 100 || need < 40);
      return num(`算数のテストを ${n}回 受けて、平均点が ${a}点 でした。${n + 1}回目のテストで何点とると、${n + 1}回の平均点が ${b}点 になりますか。`, need, '点', `${n + 1}回の合計 ${b} × ${n + 1} ＝ ${b * (n + 1)}、これまでの合計 ${a} × ${n} ＝ ${a * n}。差は ${need}`, 'meanNeed'); },
    () => { let n, m, vals, last; do { n = ri(3, 5); m = ri(30, 45); vals = []; for (let i = 0; i < n - 1; i++) vals.push(m + ri(-6, 6)); last = m * n - sum(vals); } while (last < 22 || last > 60);
      return num(`${n}人の体重の平均は ${m}kg です。そのうち ${n - 1}人の体重は ${vals.join('kg、')}kg でした。のこりの1人の体重は何kgですか。`, last, 'kg', `全体の合計 ${m} × ${n} ＝ ${m * n}、わかっている ${n - 1}人の合計 ${sum(vals)}。のこりは ${last}`, 'meanMissing'); },
  ],
  '3・4年のふくしゅう': [
    () => { const a = ri(101, 999), b = ri(11, 99);
      return num(`${a} × ${b} =`, a * b, '', `ひっ算で計算する（${a} × ${b}）`, 'mul3x2'); },
    () => { const b = ri(3, 9), q = ri(12, 99), r = ri(1, b - 1), a = b * q + r;
      return Math.random() < 0.5
        ? num(`${a} ÷ ${b} の商はいくつですか。`, q, '', `${a} ÷ ${b} ＝ ${q} あまり ${r}`, 'divQ')
        : num(`${a} ÷ ${b} のあまりはいくつですか。`, r, '', `${a} ÷ ${b} ＝ ${q} あまり ${r}`, 'divR'); },
    () => { const a = ri(101, 999), b = ri(101, 999);
      return num(`${fmt(a, 2)} + ${fmt(b, 2)} =`, fmt(a + b, 2), '', '小数点の位置をそろえて計算する', 'decAdd'); },
    () => { let a = ri(101, 999), b = ri(101, 999); if (a < b) [a, b] = [b, a]; if (a === b) a++;
      return num(`${fmt(a, 2)} − ${fmt(b, 2)} =`, fmt(a - b, 2), '', '小数点の位置をそろえて計算する', 'decSub'); },
    () => { const f = pick([['km', 'm', 1000], ['kg', 'g', 1000], ['t', 'kg', 1000], ['L', 'mL', 1000], ['L', 'dL', 10], ['m', 'cm', 100], ['cm', 'mm', 10]]);
      const dec = Math.random() < 0.5; const x10 = dec ? dt(12, 99) : ri(2, 9) * 10;
      return num(`${fmt(x10, 1)}${f[0]} は何${f[1]}ですか。`, fmt(x10 * f[2] / 10, 0), f[1], `1${f[0]} ＝ ${f[2]}${f[1]}`, 'unitConv'); },
    () => Math.random() < 0.5
      ? (() => { let a, b; do { a = ri(30, 90); b = ri(30, 90); } while (a + b > 150); return num(`三角形の3つの角のうち、2つの角が ${a}° と ${b}° です。のこりの角は何度ですか。`, 180 - a - b, '度', `三角形の3つの角の和は 180°。180 − ${a} − ${b} ＝ ${180 - a - b}`, 'angle'); })()
      : (() => { let a, b, c; do { a = ri(60, 120); b = ri(60, 120); c = ri(60, 120); } while (a + b + c > 330); return num(`四角形の4つの角のうち、3つの角が ${a}°、${b}°、${c}° です。のこりの角は何度ですか。`, 360 - a - b - c, '度', `四角形の4つの角の和は 360°。360 − ${a} − ${b} − ${c} ＝ ${360 - a - b - c}`, 'angle'); })(),
    () => { const a = ri(1, 9), b = ri(1, 9999);
      return num(`${a}億${b}万 を、数字で書きましょう。`, a * 1e8 + b * 1e4, '', `1億 ＝ 100000000、1万 ＝ 10000。${a}億 ＋ ${b}万 ＝ ${a * 1e8 + b * 1e4}`, 'bigNum'); },
    () => { const p = ri(1, 3), a = ri(2, 20), b = ri(2, 9), c = ri(2, 9);
      if (p === 1) return num(`${a} + ${b} × ${c} =`, a + b * c, '', 'かけ算を先に計算する', 'order');
      if (p === 2) return num(`(${a} + ${b}) × ${c} =`, (a + b) * c, '', '( ) の中を先に計算する', 'order');
      const e = ri(2, 9), d = ri(2, 9), m = ri(3, 9), cc = d * e; return num(`${m + 5} × ${b} − ${cc} ÷ ${d} =`, (m + 5) * b - e, '', 'かけ算・わり算を先に計算してから、ひき算', 'order'); },
    () => { const p = pick([10, 100, 1000]), x = ri(1000, 99999), place = { 10: '十', 100: '百', 1000: '千' }[p];
      return num(`${x} を四捨五入して、${place}の位までのがい数にすると、いくつですか。`, Math.floor((x + p / 2) / p) * p, '', `${place}の位の1つ下の位の数字が 5以上なら切り上げ、4以下なら切り捨てる`, 'round'); },
    () => { const h1 = ri(1, 3), m1 = ri(10, 55), h2 = ri(1, 3), m2 = ri(10, 55);
      return num(`${h1}時間${m1}分 と ${h2}時間${m2}分 をあわせると、何分ですか。`, (h1 + h2) * 60 + m1 + m2, '分', `1時間 ＝ 60分。(${h1}+${h2}) × 60 + ${m1} + ${m2}`, 'timeAdd'); },
  ],
};
// 約分・帯分数の形に関係なく、仮分数でも帯分数でも正解にする分数問題
function fracAny(html, n, d, explain, key) {
  const w = Math.floor(n / d), r = n % d;
  const show = d === 1 ? String(n) : (w > 0 ? `${n}/${d}（${w}と${r}/${d}）` : `${n}/${d}`);
  return frac(html, n, d, 'any', show, explain, key);
}
const MATH_UNITS = Object.keys(MATH);
