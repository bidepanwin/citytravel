/* =========================================================
 * main.js — 封面插画生成 + 首页渲染 + 筛选 / 搜索 / 排序 / 详情弹层
 * 依赖：data.js（DESTINATIONS、CATEGORIES、SCENE_LABELS）
 * 无框架、无依赖、无网络请求。
 * ======================================================= */

/* ---------- 小图标（内联 SVG，避免引入图标库） ---------- */
const ICONS = {
  star: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.6l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17l-5.25 2.75 1-5.85L3.5 9.75l5.9-.85L12 3.6z" fill="currentColor"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.6V12l3 1.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="6.5" width="17" height="11" rx="2.4" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 10.5h17" stroke="currentColor" stroke-width="1.7"/><circle cx="16.6" cy="14" r="1.3" fill="currentColor"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.6" y="5.4" width="16.8" height="14" rx="2.3" stroke="currentColor" stroke-width="1.7"/><path d="M3.6 9.6h16.8M8.4 3.6v3.4M15.6 3.6v3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s6.4-5.6 6.4-10.4A6.4 6.4 0 0 0 5.6 10.6C5.6 15.4 12 21 12 21z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10.4" r="2.4" stroke="currentColor" stroke-width="1.7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.6l4.4 4.4L19 7.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5l6.5 7.5-6.5 7.5-6.5-7.5 6.5-7.5z" fill="currentColor"/></svg>'
};

/* ---------- 稳定的伪随机（保证同一目的地封面每次一致） ---------- */
function makeRng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 封面插画：按 scene 类型现场生成 SVG 风景 ----------
 * variant='card'  → viewBox 0 0 480 300（8:5，与卡片封面完全等比，零裁切）
 * variant='modal' → viewBox 0 30 480 240（2:1，上下各留 30 单位，避开弹层窄幅裁切）
 * --------------------------------------------------------- */
function coverSVG(dest, suffix, variant) {
  const [sky1, sky2, sun, c1, c2, c3] = dest.palette;
  const uid = 'cv-' + dest.id + '-' + (suffix || 'card');
  const rnd = makeRng(dest.id);
  const W = 480, H = 300;
  /* 弹层用 2:1 取景框：上切 30、下切 30，正好框住太阳与水面 */
  const vb = variant === 'modal' ? '0 30 480 240' : '0 0 ' + W + ' ' + H;

  /* 山脊线生成器：给定基准高度、起伏幅度、峰数 */
  function ridge(baseY, amp, peaks, step) {
    let d = 'M0 ' + H + ' L0 ' + baseY;
    for (let i = 1; i <= peaks; i++) {
      const x = (W / peaks) * (i - 0.5);
      const px = (W / peaks) * i;
      const y = baseY - amp * (0.45 + rnd() * 0.75);
      d += ' L' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + px.toFixed(1) + ' ' + (baseY - amp * rnd() * 0.25).toFixed(1);
    }
    d += ' L' + W + ' ' + H + ' Z';
    return d;
  }

  /* 树林层：一排圆锥树 */
  function trees(baseY, count, h, w, fill, opacity) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const cx = (W / count) * i + (W / count) * rnd();
      const th = h * (0.62 + rnd() * 0.7);
      s += '<path d="M' + (cx - w / 2).toFixed(1) + ' ' + baseY + ' L' + cx.toFixed(1) + ' ' + (baseY - th).toFixed(1) +
           ' L' + (cx + w / 2).toFixed(1) + ' ' + baseY + ' Z" fill="' + fill + '" opacity="' + opacity + '"/>';
    }
    return s;
  }

  /* 水面倒影：若干横向短线段 */
  function ripples(topY, bottomY, count, color) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const y = topY + (bottomY - topY) * (i / count) + rnd() * 6;
      const w = 26 + rnd() * 96;
      const x = rnd() * (W - w);
      s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="2.2" rx="1.1" fill="' + color + '" opacity="' + (0.18 + rnd() * 0.3).toFixed(2) + '"/>';
    }
    return s;
  }

  /* 建筑群：白墙 + 深色坡屋顶 + 窗洞 */
  function houses(baseY, count, wallColor, roofColor, minH, maxH) {
    let s = '';
    const span = W / count;
    for (let i = 0; i < count; i++) {
      const w = span * 0.62 * (0.84 + rnd() * 0.32);
      const x = i * span + (span - w) / 2;
      const hh = minH + rnd() * (maxH - minH);
      const y = baseY - hh;
      const rh = Math.min(w * 0.26, 19);           /* 屋顶高度受限于墙宽，避免变成尖帐篷 */
      s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (hh + 8).toFixed(1) + '" fill="' + wallColor + '"/>';
      s += '<path d="M' + (x - w * 0.09).toFixed(1) + ' ' + y.toFixed(1) +
           ' L' + (x + w / 2).toFixed(1) + ' ' + (y - rh).toFixed(1) +
           ' L' + (x + w + w * 0.09).toFixed(1) + ' ' + y.toFixed(1) + ' Z" fill="' + roofColor + '"/>';
      /* 窗洞：让白墙有细节，不再像一块空白 */
      const cols = Math.max(1, Math.round(w / 17));
      for (let k = 0; k < cols; k++) {
        const wx = x + (w / cols) * (k + 0.5) - 3.2;
        s += '<rect x="' + wx.toFixed(1) + '" y="' + Math.min(y + 14, baseY - 18).toFixed(1) +
             '" width="6.4" height="8.5" fill="' + roofColor + '" opacity=".42"/>';
      }
    }
    return s;
  }

  let scene = '';

  if (dest.scene === 'mountain') {
    scene =
      '<circle cx="352" cy="86" r="44" fill="' + sun + '"/>' +
      '<circle cx="352" cy="86" r="76" fill="' + sun + '" opacity=".2"/>' +
      '<path d="' + ridge(210, 78, 5) + '" fill="' + c1 + '" opacity=".9"/>' +
      '<path d="' + ridge(238, 74, 4) + '" fill="' + c2 + '"/>' +
      '<path d="' + ridge(268, 62, 3) + '" fill="' + c3 + '"/>' +
      '<path d="M0 268 L92 236 L176 268 L268 232 L372 268 L480 240 L480 300 L0 300 Z" fill="' + c3 + '" opacity=".92"/>';

  } else if (dest.scene === 'water') {
    scene =
      '<circle cx="120" cy="84" r="40" fill="' + sun + '"/>' +
      '<path d="' + ridge(186, 52, 5) + '" fill="' + c1 + '" opacity=".92"/>' +
      '<path d="' + ridge(206, 44, 4) + '" fill="' + c2 + '"/>' +
      '<rect x="0" y="212" width="' + W + '" height="88" fill="' + c3 + '"/>' +
      '<rect x="0" y="212" width="' + W + '" height="10" fill="' + c2 + '" opacity=".55"/>' +
      ripples(222, 296, 22, '#ffffff') +
      '<ellipse cx="120" cy="228" rx="54" ry="7" fill="' + sun + '" opacity=".35"/>';

  } else if (dest.scene === 'town') {
    scene =
      '<circle cx="384" cy="72" r="34" fill="' + sun + '" opacity=".92"/>' +
      '<circle cx="384" cy="72" r="60" fill="' + sun + '" opacity=".18"/>' +
      '<path d="' + ridge(150, 36, 7) + '" fill="' + c1 + '" opacity=".78"/>' +
      houses(242, 11, '#fdfaf4', c3, 38, 70) +
      '<rect x="0" y="242" width="' + W + '" height="58" fill="' + c3 + '" opacity=".88"/>' +
      '<rect x="0" y="242" width="' + W + '" height="5" fill="' + c2 + '" opacity=".5"/>' +
      ripples(250, 294, 16, '#ffffff') +
      '<ellipse cx="384" cy="248" rx="34" ry="5" fill="' + sun + '" opacity=".3"/>';

  } else if (dest.scene === 'sea') {
    scene =
      '<circle cx="368" cy="90" r="30" fill="' + sun + '"/>' +
      '<circle cx="368" cy="90" r="56" fill="' + sun + '" opacity=".18"/>' +
      /* 远处岛屿剪影，压住空荡的海平线 */
      '<path d="M-20 176 Q56 132 132 176 Z" fill="' + c1 + '" opacity=".9"/>' +
      '<path d="M96 176 Q138 148 182 176 Z" fill="' + c2 + '" opacity=".85"/>' +
      '<rect x="0" y="176" width="' + W + '" height="124" fill="' + c3 + '"/>' +
      '<rect x="0" y="176" width="' + W + '" height="124" fill="' + c2 + '" opacity=".22"/>' +
      '<rect x="0" y="176" width="' + W + '" height="16" fill="#ffffff" opacity=".16"/>' +
      '<ellipse cx="368" cy="186" rx="46" ry="6" fill="' + sun + '" opacity=".34"/>' +
      '<path d="M0 214q60-13 120 0t120 0 120 0 120 0" stroke="#ffffff" stroke-width="2.4" fill="none" opacity=".45"/>' +
      '<path d="M0 246q60-13 120 0t120 0 120 0 120 0" stroke="#ffffff" stroke-width="2.4" fill="none" opacity=".3"/>' +
      '<path d="M0 276q60-13 120 0t120 0 120 0 120 0" stroke="#ffffff" stroke-width="2.4" fill="none" opacity=".2"/>' +
      /* 帆船 */
      '<path d="M150 232h56l-11 13h-34z" fill="#ffffff" opacity=".92"/>' +
      '<path d="M180 232v-42l30 34z" fill="#ffffff" opacity=".88"/>' +
      '<path d="M150 232h56l-11 13h-34z" fill="' + c3 + '" opacity=".18"/>';

  } else if (dest.scene === 'forest') {
    scene =
      '<circle cx="106" cy="82" r="38" fill="' + sun + '" opacity=".92"/>' +
      trees(226, 11, 92, 46, c1, 0.75) +
      trees(252, 9, 104, 52, c2, 0.95) +
      trees(288, 7, 116, 60, c3, 1) +
      '<rect x="0" y="286" width="' + W + '" height="14" fill="' + c3 + '"/>';

  } else { /* city */
    const rndB = makeRng(dest.id + 'city');
    let blocks = '';
    let x = 6;
    while (x < W - 20) {
      const w = 26 + rndB() * 40;
      const hh = 46 + rndB() * 116;
      const y = 250 - hh;
      blocks += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="' + c2 + '"/>';
      blocks += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="' + c3 + '" opacity="' + (0.3 + rndB() * 0.45).toFixed(2) + '"/>';
      for (let wy = y + 12; wy < 242; wy += 16) {
        for (let wx = x + 7; wx < x + w - 8; wx += 13) {
          if (rndB() > 0.42) blocks += '<rect x="' + wx.toFixed(1) + '" y="' + wy.toFixed(1) + '" width="5" height="7" fill="' + sun + '" opacity="' + (0.35 + rndB() * 0.5).toFixed(2) + '"/>';
        }
      }
      x += w + 8 + rndB() * 8;
    }
    scene =
      '<circle cx="386" cy="70" r="34" fill="' + sun + '" opacity=".85"/>' +
      blocks +
      '<rect x="0" y="250" width="' + W + '" height="50" fill="' + c3 + '" opacity=".92"/>' +
      '<path d="M0 250h480" stroke="#ffffff" stroke-width="2" opacity=".25"/>';
  }

  return '' +
    '<svg class="cover-svg" viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + dest.name + '封面插画">' +
      '<defs>' +
        '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="' + sky1 + '"/>' +
          '<stop offset="100%" stop-color="' + sky2 + '"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + uid + ')"/>' +
      scene +
    '</svg>';
}

/* ---------- 封面：优先真实照片，加载失败自动回退到 SVG 插画 ----------
 * variant='card'  → assets/img/<id>-card.jpg（800×500，8:5，与 .card-cover 等比）
 * variant='modal' → assets/img/<id>-wide.jpg（1200×600，2:1，与 .modal-cover 等比）
 * 照片不存在时（或加载失败）退回 coverSVG()，所以断网 / 图片缺失也不会开天窗。
 * 失败回退走全局 error 捕获（见 initEvents），不用内联 onerror，避免 CSP 与转义问题。
 * ------------------------------------------------------------------- */
function coverHTML(dest, suffix, variant) {
  const kind = variant === 'modal' ? 'wide' : 'card';
  const src = dest.photo && dest.photo[kind];
  if (!src) return coverSVG(dest, suffix, variant);
  return '<img class="cover-img" src="' + src + '" alt="' + dest.name + '实景照片"' +
         ' loading="lazy" decoding="async"' +
         ' data-cover-id="' + dest.id + '" data-cover-kind="' + kind + '">';
}

/* 非「本尊」照片的角标：明确标注是同类/同区域景观，避免误导 */
function shotTagHTML(d) {
  const label = d.photo ? (PHOTO_MATCH_LABEL[d.photo.match] || '') : '';
  if (!label) return '';
  const tip = d.photo.note ? '（' + d.photo.note + '）' : '';
  return '<span class="card-shot-tag" title="免版权图库中没有该景点的本尊照片，此处为同类真实景观">' +
         label + tip + '</span>';
}

/* 弹层底部的图片来源标注（Pexels License 不强制署名，这里仍标注） */
function creditHTML(d) {
  if (!d.photo) return '';
  const label = PHOTO_MATCH_LABEL[d.photo.match] || '';
  return '<p class="modal-credit">封面照片：' + d.photo.by + ' / Pexels' +
         (label ? ' · ' + label : '') +
         ' <a href="' + d.photo.src + '" target="_blank" rel="noopener noreferrer">原图</a></p>';
}

/* ---------- 工具 ---------- */
const $ = (sel) => document.querySelector(sel);
const money = (n) => '¥' + n.toLocaleString('en-US');
const durationDays = (s) => parseInt(String(s).replace(/[^\d]/g, '').slice(0, 1), 10) || 9;

/* ---------- 卡片模板 ---------- */
function cardHTML(d) {
  const tags = d.tags.map((t) => '<li>' + t + '</li>').join('');
  return '' +
  '<article class="card" data-id="' + d.id + '" tabindex="0" role="button" aria-label="查看 ' + d.name + ' 详情">' +
    '<div class="card-cover">' +
      coverHTML(d, 'card') +
      '<span class="card-cat">' + d.category + '</span>' +
      '<span class="card-rating-badge">' + ICONS.star + d.rating.toFixed(1) + '</span>' +
      '<span class="card-scene">' + (SCENE_LABELS[d.scene] || '') + '</span>' +
      shotTagHTML(d) +
    '</div>' +
    '<div class="card-body">' +
      '<p class="card-region">' + ICONS.pin + d.region + ' · ' + d.area + '</p>' +
      '<h3 class="card-name">' + d.name + '</h3>' +
      '<p class="card-blurb">' + d.blurb + '</p>' +
      '<ul class="card-tags">' + tags + '</ul>' +
      '<dl class="card-meta">' +
        '<div class="meta-item">' + ICONS.clock + '<dt>时长</dt><dd>' + d.duration + '</dd></div>' +
        '<div class="meta-item">' + ICONS.wallet + '<dt>人均预算</dt><dd>' + money(d.budgetMin) + '–' + d.budgetMax.toLocaleString('en-US') + '</dd></div>' +
        '<div class="meta-item">' + ICONS.calendar + '<dt>最佳时节</dt><dd>' + d.bestTime + '</dd></div>' +
      '</dl>' +
      '<button class="card-cta" type="button">查看行程详情<span aria-hidden="true">→</span></button>' +
    '</div>' +
  '</article>';
}

/* ---------- 详情弹层内容 ---------- */
function modalHTML(d) {
  const highlights = d.highlights.map((h) => '<li>' + ICONS.check + '<span>' + h + '</span></li>').join('');
  const itinerary = d.itinerary.map((day) => (
    '<div class="itin-day">' +
      '<h4>' + day.day + '</h4>' +
      '<ol>' + day.items.map((i) => '<li>' + i + '</li>').join('') + '</ol>' +
    '</div>'
  )).join('');

  return '' +
  '<div class="modal-head">' +
    '<p class="modal-region">' + ICONS.pin + d.region + ' · ' + d.area + ' · ' + d.category + '</p>' +
    '<h3 class="modal-title" id="modalTitle">' + d.name + '</h3>' +
    '<p class="modal-blurb">' + d.blurb + '</p>' +
    '<div class="modal-kpis">' +
      '<div class="kpi"><span>评分</span><strong>' + d.rating.toFixed(1) + ' / 5.0</strong></div>' +
      '<div class="kpi"><span>建议时长</span><strong>' + d.duration + '</strong></div>' +
      '<div class="kpi"><span>人均预算</span><strong>' + money(d.budgetMin) + '–' + d.budgetMax.toLocaleString('en-US') + '</strong></div>' +
      '<div class="kpi"><span>最佳时节</span><strong>' + d.bestTime + '</strong></div>' +
    '</div>' +
  '</div>' +
  '<div class="modal-grid">' +
    '<section class="modal-block">' +
      '<h4 class="block-title">' + ICONS.dots + '值得看的</h4>' +
      '<ul class="hl-list">' + highlights + '</ul>' +
    '</section>' +
    '<section class="modal-block">' +
      '<h4 class="block-title">' + ICONS.dots + '建议行程</h4>' +
      '<div class="itin">' + itinerary + '</div>' +
    '</section>' +
  '</div>' +
  '<div class="modal-tags">' + d.tags.map((t) => '<span class="chip-static">' + t + '</span>').join('') + '</div>' +
  creditHTML(d);
}

/* =========================================================
 * 地图模块（腾讯地图 GL JS · 代理模式）
 *   · SDK 走官方 CDN，URL 不带 key；代理配置写在 index.html <head> 的
 *     window._TMapSecurityConfig 里，前端零密钥。
 *   · 标注用 MultiMarker：图钉与名称合成一个文本标注，随图钉一起参与避让。
 *   · 与筛选联动：非命中项灰化保留方位感，视野自动框选命中项。
 *   · 地图不可用时不阻断页面，降级成「按城市分组」的清单。
 * ======================================================= */

/* 出发地参考点：不是目的地，只在图上做方位参照 */
const HOME = { id: '__home', name: '杭州', coord: [120.15, 30.27] };

/* 主题 → 图钉配色；未收录的主题走兜底色 */
const CAT_STYLE = [
  { cat: '自然山水', color: '#2f7d6e' },
  { cat: '古镇水乡', color: '#c0563a' },
  { cat: '海岛',     color: '#2b7fb8' },
  { cat: '徒步登山', color: '#8a6a3b' },
  { cat: '亲子',     color: '#d1842c' },
  { cat: '城市人文', color: '#6b5f8c' }
];
const CAT_FALLBACK_COLOR = '#8b857a';
const CAT_UNKNOWN = CAT_STYLE.length;   /* 兜底样式槽位 */

function catIndex(cat) {
  for (let i = 0; i < CAT_STYLE.length; i++) if (CAT_STYLE[i].cat === cat) return i;
  return CAT_UNKNOWN;
}
function catColor(cat) {
  const i = catIndex(cat);
  return i === CAT_UNKNOWN ? CAT_FALLBACK_COLOR : CAT_STYLE[i].color;
}

/* 图标一律内联 SVG → data URI：不引用官方 demo 图片，零跨域、零 404 */
function dataURI(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function pinURI(color) {
  return dataURI(
    '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">' +
      '<path d="M15 1.6C7.8 1.6 2 7.4 2 14.5c0 9.5 13 21.9 13 21.9s13-12.4 13-21.9C28 7.4 22.2 1.6 15 1.6z" fill="' + color + '" stroke="#ffffff" stroke-width="2.2"/>' +
      '<circle cx="15" cy="14.5" r="4.7" fill="#ffffff"/>' +
    '</svg>'
  );
}
function homeURI() {
  return dataURI(
    '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">' +
      '<circle cx="13" cy="13" r="11.6" fill="#ffffff" opacity=".92"/>' +
      '<circle cx="13" cy="13" r="7.6" fill="#221f1a"/>' +
      '<circle cx="13" cy="13" r="3.1" fill="#f6d38f"/>' +
    '</svg>'
  );
}

/* dim=true 用于「被筛选掉」的标注：图钉转灰、文字转浅，但仍留在图上做参照 */
function markerStyle(color, dim) {
  return new TMap.MarkerStyle({
    width: 30,
    height: 38,
    anchor: { x: 15, y: 36 },          /* 锚点落在图钉尖端，位置才准 */
    src: pinURI(color),
    direction: 'bottom',               /* 名称放在图钉正下方 */
    offset: { x: 0, y: 3 },
    color: dim ? '#a29c93' : '#221f1a',
    size: 12,
    padding: '3px 8px',
    backgroundColor: dim ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.92)',
    backgroundBorderWidth: 1,
    backgroundBorderColor: dim ? 'rgba(34,31,26,.07)' : 'rgba(34,31,26,.14)',
    backgroundBorderRadius: 8,
    opacity: dim ? 0.55 : 1
  });
}

/* 超时预算：SDK 本体约 2.2 MB，实测冷启动可达 5~6 秒，再加底图瓦片，
   原来的 9 秒太紧，会在慢网下误报「地图不可用」。 */
const MAP_SDK_TIMEOUT = 15000;
const MAP_TILE_TIMEOUT = 12000;

const mapState = {
  started: false, ready: false, failed: false,
  map: null, markers: null,
  pending: null, fitKey: null, fitTimer: 0, hoverId: '', slowTimer: 0
};

/* ---------- 图例 ---------- */
function renderLegend() {
  const el = $('#mapLegend');
  if (!el) return;
  el.innerHTML = CAT_STYLE.map((s) =>
    '<b><i style="background:' + s.color + '"></i>' + s.cat + '</b>'
  ).join('');
}

/* ---------- 右侧清单 ---------- */
function renderMapList(list) {
  const el = $('#mapList');
  if (!el) return;
  const on = {};
  list.forEach((d) => { on[d.id] = 1; });

  /* 自北向南排：读起来像一条从苏州一路往南走的路线 */
  const sorted = DESTINATIONS.slice().sort((a, b) => b.coord[1] - a.coord[1] || a.coord[0] - b.coord[0]);
  el.innerHTML = sorted.map((d) =>
    '<li><button class="map-item' + (on[d.id] ? '' : ' is-dim') + '" type="button" data-id="' + d.id + '">' +
      '<i class="map-dot" style="background:' + catColor(d.category) + '"></i>' +
      '<span class="map-item-main"><b>' + d.name + '</b><small>' + d.region + ' · ' + d.duration + '</small></span>' +
      '<span class="map-item-rate">' + d.rating.toFixed(1) + '</span>' +
    '</button></li>'
  ).join('');

  const cnt = $('#mapCount');
  if (cnt) {
    cnt.textContent = list.length === DESTINATIONS.length
      ? '共 ' + DESTINATIONS.length + ' 个目的地'
      : '高亮 ' + list.length + ' / ' + DESTINATIONS.length + ' 个';
  }
}

/* =========================================================
 * 静态位置示意图（零网络依赖的兜底方案）
 * ---------------------------------------------------------
 * 为什么线上一定要兜底：腾讯地图在这里走的是「本地代理 + 前端零密钥」模式
 * （见 index.html 的 _TMapSecurityConfig），那个代理只存在于本机预览环境，
 * 公网访客的浏览器里根本没有它；而且 GitHub Pages 是 HTTPS，
 * 浏览器会直接拦掉指向 http 服务地址的请求（混合内容策略）。
 * 所以静态托管下在线底图必然拿不到 —— 这不是配置问题，是原理限制。
 *
 * 兜底图的做法：用墨卡托把经纬度还原成画布坐标，只画
 * 「点 + 名称 + 杭州辐射圈」，不依赖任何瓦片服务、不绘制任何行政边界，
 * 因此离线和 GitHub Pages 都能正常显示，筛选 / 清单 / 弹层照样联动。
 * 想要真实底图，填 assets/js/config.js 里的 tmapKey 即可。
 * ======================================================= */
const STATIC_MAP = { active: false, list: [] };
const HUB_RING_KM = 200;                    /* 2 小时交通圈的示意半径 */

/* 读取站点配置里的地图 Key（config.js） */
function siteTmapKey() {
  return String((window.SITE_CONFIG && window.SITE_CONFIG.tmapKey) || '').trim();
}

/* 墨卡托纬度投影：与在线地图同一套投影，南北方位才对得上 */
function mercY(lat) {
  return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
}

/* 标签避让：浙北几个点相距不到 40 公里，不避让必然糊成一团。
   每个标签从 6 个候选方位里挑第一个「不出画布且不与已放置标签重叠」的位置。 */
function placeStaticLabels(nodes, W, H) {
  const CAND = [
    { dx: 11, dy: 4.5, anchor: 'start' },
    { dx: -11, dy: 4.5, anchor: 'end' },
    { dx: 0, dy: -16, anchor: 'middle' },
    { dx: 0, dy: 25, anchor: 'middle' },
    { dx: 13, dy: -13, anchor: 'start' },
    { dx: -13, dy: -13, anchor: 'end' }
  ];
  const boxes = [];
  nodes.forEach((n) => {
    const w = n.name.length * 13 + 16;
    const h = 21;
    let pick = CAND[0];
    for (let i = 0; i < CAND.length; i++) {
      const c = CAND[i];
      let x = n.x + c.dx;
      if (c.anchor === 'end') x -= w;
      else if (c.anchor === 'middle') x -= w / 2;
      const y = n.y + c.dy - h / 2;
      const box = { x0: x, y0: y, x1: x + w, y1: y + h };
      const inCanvas = box.x0 > 3 && box.x1 < W - 3 && box.y0 > 3 && box.y1 < H - 3;
      const hit = boxes.some((b) => !(box.x1 < b.x0 || box.x0 > b.x1 || box.y1 < b.y0 || box.y0 > b.y1));
      if (inCanvas && !hit) { pick = c; boxes.push(box); break; }
      if (i === CAND.length - 1) boxes.push(box);   /* 都不行就就近硬放，至少不来回跳 */
    }
    n.label = pick;
  });
}

/* ---------- 生成示意图 SVG ---------- */
function staticMapSVG(list) {
  /* viewBox 比例刻意贴近画布（约 1.75），等比缩放到容器后左右留白最少 */
  const W = 820, H = 470, PAD = 52;
  const D2R = Math.PI / 180;
  const EARTH_R = 6378.137;                     /* km，只用于把「公里」换成画布像素 */
  const on = {};
  list.forEach((d) => { on[d.id] = 1; });

  const lats = DESTINATIONS.map((d) => d.coord[1]).concat([HOME.coord[1]]);
  const lngs = DESTINATIONS.map((d) => d.coord[0]).concat([HOME.coord[0]]);
  const minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
  const minLng = Math.min.apply(null, lngs), maxLng = Math.max.apply(null, lngs);
  /* 关键：经度也要换成弧度再和墨卡托 y 比。一边用「度」一边用「弧度」量纲不一致，
     会让纵向被压扁 —— 12 个点全挤在一条横线上，圆圈也被拉成椭圆。 */
  const minX = minLng * D2R, maxX = maxLng * D2R;
  const minY = mercY(minLat), maxY = mercY(maxLat);

  const k = Math.min((W - PAD * 2) / (maxX - minX), (H - PAD * 2) / (maxY - minY));
  const ox = W / 2 - ((minX + maxX) / 2) * k;
  const oy = H / 2 + ((minY + maxY) / 2) * k;
  const proj = (c) => ({ x: c[0] * D2R * k + ox, y: oy - mercY(c[1]) * k });

  /* 经纬网格：只做方位参照，不带任何行政含义 */
  let grid = '';
  for (let g = Math.ceil(minLng); g <= Math.floor(maxLng); g++) {
    const x = (g * D2R * k + ox).toFixed(1);
    grid += '<line class="mstat-grid" x1="' + x + '" y1="0" x2="' + x + '" y2="' + H + '"/>';
  }
  for (let g = Math.ceil(minLat); g <= Math.floor(maxLat); g++) {
    const y = (oy - mercY(g) * k).toFixed(1);
    grid += '<line class="mstat-grid" x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '"/>';
  }

  const home = proj(HOME.coord);
  /* 墨卡托上 1 弧度经度 ≈ EARTH_R·cos(φ) 公里，据此把 200 公里换成像素，
     这样画出来的才是正圆而不是椭圆 */
  const ringR = (HUB_RING_KM * k) / (EARTH_R * Math.cos(HOME.coord[1] * D2R));

  const nodes = DESTINATIONS.map((d) => {
    const p = proj(d.coord);
    return { id: d.id, name: d.name, x: p.x, y: p.y, color: catColor(d.category), hit: !!on[d.id] };
  });
  /* 出发地也参与标签避让，否则「杭州」容易被邻居盖住 */
  const all = nodes.concat([{ id: HOME.id, name: '杭州 · 出发地', x: home.x, y: home.y, color: '#221f1a', hit: true }]);
  placeStaticLabels(all, W, H);

  /* 辐射线：只画命中项，表达「都从杭州出发」 */
  let rays = '';
  nodes.forEach((n) => {
    if (!n.hit) return;
    rays += '<line class="mstat-ray" x1="' + home.x.toFixed(1) + '" y1="' + home.y.toFixed(1) +
            '" x2="' + n.x.toFixed(1) + '" y2="' + n.y.toFixed(1) + '"/>';
  });

  function labelSVG(n) {
    const lb = n.label;
    return '<text class="mstat-lb" x="' + (n.x + lb.dx).toFixed(1) + '" y="' + (n.y + lb.dy).toFixed(1) +
           '" text-anchor="' + lb.anchor + '" dominant-baseline="middle">' + n.name + '</text>';
  }

  const homeNode =
    '<g class="mstat-node mstat-node-home" data-id="' + HOME.id + '">' +
      '<circle class="mstat-halo" cx="' + home.x.toFixed(1) + '" cy="' + home.y.toFixed(1) + '" r="14"/>' +
      '<circle class="mstat-pt" cx="' + home.x.toFixed(1) + '" cy="' + home.y.toFixed(1) + '" r="7.5" fill="#221f1a"/>' +
      '<circle cx="' + home.x.toFixed(1) + '" cy="' + home.y.toFixed(1) + '" r="3" fill="#f6d38f"/>' +
      labelSVG(all[all.length - 1]) +
    '</g>';

  const destNodes = nodes.map((n) => (
    '<g class="mstat-node' + (n.hit ? '' : ' is-dim') + '" data-id="' + n.id + '" tabindex="0" role="button" aria-label="查看 ' + n.name + ' 详情">' +
      '<circle class="mstat-hit" cx="' + n.x.toFixed(1) + '" cy="' + n.y.toFixed(1) + '" r="14"/>' +
      '<circle class="mstat-halo" cx="' + n.x.toFixed(1) + '" cy="' + n.y.toFixed(1) + '" r="11"/>' +
      '<circle class="mstat-pt" cx="' + n.x.toFixed(1) + '" cy="' + n.y.toFixed(1) + '" r="6.5" fill="' + n.color + '"/>' +
      labelSVG(n) +
    '</g>'
  )).join('');

  return '' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="目的地相对位置示意图">' +
      '<defs>' +
        '<linearGradient id="mstat-bg" x1="0" y1="0" x2="0.4" y2="1">' +
          '<stop offset="0%" stop-color="#fdf9f2"/>' +
          '<stop offset="100%" stop-color="#f4f1e8"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#mstat-bg)"/>' +
      grid +
      '<circle class="mstat-ring" cx="' + home.x.toFixed(1) + '" cy="' + home.y.toFixed(1) + '" r="' + ringR.toFixed(1) + '"/>' +
      '<text class="mstat-ring-lb" x="' + home.x.toFixed(1) + '" y="' + (home.y + ringR + 15).toFixed(1) + '" text-anchor="middle">2 小时交通圈（示意）</text>' +
      rays +
      homeNode +
      destNodes +
    '</svg>';
}

/* 渲染 / 切换到示意图模式 */
function renderStaticMap(list) {
  const el = $('#mapStatic');
  if (!el) return;
  STATIC_MAP.list = list;
  el.innerHTML = staticMapSVG(list);
  el.hidden = false;
}

function showStaticMap(reason) {
  const first = !STATIC_MAP.active;
  STATIC_MAP.active = true;
  mapState.failed = true;
  clearTimeout(mapState.slowTimer);
  const ov = $('#mapOverlay'); if (ov) ov.hidden = true;
  const root = $('#wbMap'); if (root) root.hidden = true;   /* 收起在线地图容器（含 SDK 自插的控件） */
  const note = $('#mapStaticNote');
  if (note) { note.hidden = false; if (reason) note.title = reason; }
  const btn = $('#mapReset');
  if (btn) btn.hidden = true;                               /* 示意图没有视野概念，全览按钮先收起来 */
  renderStaticMap(mapState.pending || applyFilter());
  if (first) renderMapList(STATIC_MAP.list);
}

/* ---------- 遮罩：加载中 / 成功 / 降级 ---------- */
function mapLoading() {
  const ov = $('#mapOverlay');
  if (!ov) return;
  ov.hidden = false;
  const sp = $('#mapSpinner'); if (sp) sp.hidden = false;
  $('#mapOverlayTitle').textContent = '正在加载地图';
  $('#mapOverlayDesc').textContent = '正在连接地图服务…';
  $('#mapOverlayList').innerHTML = '';
  /* 下载确实偏重，超时前先给个说法，免得用户以为卡死了 */
  clearTimeout(mapState.slowTimer);
  mapState.slowTimer = setTimeout(() => {
    if (mapState.ready || mapState.failed) return;
    const d = $('#mapOverlayDesc');
    if (d) d.textContent = '地图底图包约 2 MB，正在下载，仍在继续…';
  }, 6000);
}
function mapReady() {
  if (mapState.ready) return;
  mapState.ready = true;
  clearTimeout(mapState.slowTimer);
  const root = $('#wbMap');
  if (root) root.hidden = false;      /* 若曾降级过，这里还能收回来 */
  const ov = $('#mapOverlay');
  if (ov) ov.hidden = true;
}
function mapFail(reason) {
  if (mapState.ready || mapState.failed) return;
  /* 在线底图拿不到（静态托管 / 离线 / 网络策略拦截）时，
     不再只丢一句「暂不可用」，直接换成按经纬度还原的位置示意图。 */
  showStaticMap(reason);
}
/* 备用：把目的地按省份分组的一行式清单（示意图渲染失败时才需要） */
function fallbackListHTML() {
  const groups = [];
  DESTINATIONS.forEach((d) => {
    const g = groups.filter((x) => x.region === d.region)[0];
    if (g) g.names.push(d.name);
    else groups.push({ region: d.region, names: [d.name] });
  });
  return groups.map((g) =>
    '<li><span class="fb-region">' + g.region + '</span><span class="fb-names">' + g.names.join('、') + '</span></li>'
  ).join('');
}

/* ---------- 注入 SDK ---------- */
function loadTMapSDK(useOwnKey, done) {
  if (window.TMap) { done(true); return; }
  let settled = false;
  const finish = (ok) => { if (settled) return; settled = true; done(ok); };
  let url = 'https://map.qq.com/api/gljs?v=1.exp';
  if (useOwnKey) {
    /* 用自己的 Key 走标准模式：必须先撤掉代理配置 —— 两者同时存在，
       官方明确说明会导致底图变空白。 */
    try { delete window._TMapSecurityConfig; } catch (e) { window._TMapSecurityConfig = undefined; }
    url += '&key=' + encodeURIComponent(siteTmapKey());
  }
  const s = document.createElement('script');
  s.charset = 'utf-8';
  s.async = true;
  s.src = url;
  s.onload = () => finish(!!window.TMap);
  s.onerror = () => finish(false);
  document.head.appendChild(s);
  setTimeout(() => finish(!!window.TMap), MAP_SDK_TIMEOUT);   /* 网络受限时不要一直转圈 */
}

/* 地图代理是否可用。
   地图服务走的是本地 http 代理（见 index.html 的 _TMapSecurityConfig），
   在 HTTPS 站点（GitHub Pages 等静态托管）下会被浏览器的混合内容策略直接拦掉：
   请求根本发不出去，底图必然拿不到。网页协议为 https 时，
   只有服务地址本身也是 https 才不会被拦。
   抽成纯函数是为了能被冒烟测试直接覆盖（见 wb-smoke.js）。 */
function mapProxyUsable(protocol, serviceHost) {
  const p = String(protocol || '');
  if (p !== 'https:') return true;                                  /* http / file: 下代理可直连 */
  return String(serviceHost || '').indexOf('https:') === 0;         /* https 站点需 https 服务地址 */
}

/* ---------- 建立地图 ---------- */
function buildMap(root) {
  const map = new TMap.Map(root, {
    center: new TMap.LatLng(29.8, 120.1),
    zoom: 8,
    minZoom: 5,
    maxZoom: 16,
    pitch: 0,
    rotation: 0,
    viewMode: '2D',          /* 固定 2D：避免误触旋转后方位感丢失 */
    doubleClickZoom: true
  });
  mapState.map = map;

  /* 每个主题两套样式（命中 / 灰化），外加出发地一套 */
  const styles = {};
  CAT_STYLE.forEach((s, i) => {
    styles['s' + i + 'a'] = markerStyle(s.color, false);
    styles['s' + i + 'd'] = markerStyle('#a8a29a', true);
  });
  styles['s' + CAT_UNKNOWN + 'a'] = markerStyle(CAT_FALLBACK_COLOR, false);
  styles['s' + CAT_UNKNOWN + 'd'] = markerStyle('#a8a29a', true);
  styles.home = new TMap.MarkerStyle({
    width: 26, height: 26, anchor: { x: 13, y: 13 },
    src: homeURI(),
    direction: 'bottom', offset: { x: 0, y: 3 },
    color: '#221f1a', size: 12, padding: '3px 9px',
    backgroundColor: 'rgba(246,211,143,.95)',
    backgroundBorderWidth: 1, backgroundBorderColor: 'rgba(34,31,26,.18)',
    backgroundBorderRadius: 8
  });

  const markers = new TMap.MultiMarker({
    id: 'weekend-guide-markers',
    map: map,
    styles: styles,
    /* 关键：开启图层内碰撞。乌镇 / 西塘 / 南浔 / 苏州 相距不到 40 公里，
       低缩放下名称必然重叠，交给引擎按 rank 自动取舍，比自己调坐标稳。 */
    collisionOptions: { sameSource: true, crossSource: false, vectorBaseMapSource: true },
    geometries: []
  });
  mapState.markers = markers;

  markers.on('click', (evt) => {
    const g = evt && evt.geometry;
    if (g && g.id && g.id !== HOME.id) openModal(g.id);
  });
  /* 鼠标压到图钉上时，右侧清单同步高亮，两边对得上 */
  markers.on('hover', (evt) => {
    const id = evt && evt.geometry ? evt.geometry.id : '';
    if (id === mapState.hoverId) return;
    mapState.hoverId = id;
    document.querySelectorAll('#mapList .map-item').forEach((b) => {
      b.classList.toggle('is-hover', b.dataset.id === id);
    });
  });

  /* 「地图对象建好了」不等于「底图出来了」，要等 tilesloaded 才算真成功，
     否则代理不可达时会停在灰底图上，看起来像没坏。 */
  let tiled = false;
  map.on('tilesloaded', () => {
    if (tiled) return;
    tiled = true;
    mapReady();
    syncMap(mapState.pending || applyFilter());
  });
  setTimeout(() => {
    if (!tiled) mapFail('底图未能在预期时间内加载（离线、被网络策略拦截，或未运行在预览环境中）。');
  }, MAP_TILE_TIMEOUT);
}

/* ---------- 与筛选联动 ---------- */
function syncMap(list) {
  mapState.pending = list;
  renderMapList(list);
  if (STATIC_MAP.active) renderStaticMap(list);   /* 示意图模式下，筛选结果直接重绘 */

  const markers = mapState.markers;
  if (!markers) return;

  const on = {};
  list.forEach((d) => { on[d.id] = 1; });

  const geoms = [{
    id: HOME.id,
    styleId: 'home',
    position: new TMap.LatLng(HOME.coord[1], HOME.coord[0]),
    rank: 3,                                  /* 出发地永远优先占位 */
    content: HOME.name + ' · 出发地'
  }];
  DESTINATIONS.forEach((d) => {
    const hit = !!on[d.id];
    geoms.push({
      id: d.id,
      styleId: 's' + catIndex(d.category) + (hit ? 'a' : 'd'),
      position: new TMap.LatLng(d.coord[1], d.coord[0]),
      rank: hit ? 2 : 1,
      content: d.name
    });
  });
  markers.setGeometries(geoms);

  scheduleFit(list);
}

function scheduleFit(list) {
  if (!mapState.map) return;
  const key = list.map((d) => d.id).join(',');
  if (key === mapState.fitKey) return;   /* 命中集合没变就不重新框选，免得打字时地图乱晃 */
  mapState.fitKey = key;
  clearTimeout(mapState.fitTimer);
  mapState.fitTimer = setTimeout(() => fitToList(list), 280);
}

function fitToList(list) {
  const map = mapState.map;
  if (!map) return;
  const pts = list.length ? list : DESTINATIONS;
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  pts.forEach((d) => {
    minLat = Math.min(minLat, d.coord[1]); maxLat = Math.max(maxLat, d.coord[1]);
    minLng = Math.min(minLng, d.coord[0]); maxLng = Math.max(maxLng, d.coord[0]);
  });
  map.fitBounds(
    new TMap.LatLngBounds(new TMap.LatLng(minLat, minLng), new TMap.LatLng(maxLat, maxLng)),
    { padding: 76, maxZoom: 11, ease: { duration: 420 } }
  );
}

/* ---------- 启动：滚动到附近再加载，省首屏时间 ---------- */
function initMap() {
  const root = $('#wbMap');
  if (!root) return;
  renderLegend();

  /* 三条路，按优先级：
     1) 配了自己的 Key（config.js）→ 标准模式，HTTPS 站点下也能出真实底图；
     2) 没配 Key、但能连本地代理 → 预览环境的原行为，保留不变；
     3) 两个都没有（GitHub Pages 等静态托管）→ 直接上位置示意图，不留一块空白。 */
  const cfg = window._TMapSecurityConfig || {};
  const protocol = (typeof location !== 'undefined' && location) ? location.protocol : 'file:';
  const ownKey = siteTmapKey();

  if (!ownKey && !mapProxyUsable(protocol, cfg.serviceHost)) {
    mapState.started = true;
    showStaticMap('当前是静态托管环境（HTTPS），在线地图服务无法在此访问。');
    return;
  }

  const boot = () => {
    if (mapState.started) return;
    mapState.started = true;
    mapLoading();
    loadTMapSDK(!!ownKey, (ok) => {
      if (!ok) { mapFail('地图服务未能加载（离线或被网络策略拦截）。'); return; }
      try { buildMap(root); }
      catch (e) { mapFail('地图初始化失败。'); }
    });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { io.disconnect(); boot(); return; }
      }
    }, { rootMargin: '320px 0px' });
    io.observe(root);
  } else {
    boot();
  }
}

/* ---------- 状态 ---------- */
const state = { category: '全部', keyword: '', sort: 'rating' };

function applyFilter() {
  const kw = state.keyword.trim().toLowerCase();
  let list = DESTINATIONS.filter((d) => {
    const catOk = state.category === '全部' || d.category === state.category;
    if (!catOk) return false;
    if (!kw) return true;
    const hay = [d.name, d.region, d.area, d.category, d.blurb, d.tags.join(' '), SCENE_LABELS[d.scene]].join(' ').toLowerCase();
    return hay.indexOf(kw) !== -1;
  });

  const sorters = {
    rating: (a, b) => b.rating - a.rating,
    budget: (a, b) => a.budgetMin - b.budgetMin,
    duration: (a, b) => durationDays(a.duration) - durationDays(b.duration) || b.rating - a.rating,
    name: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN')
  };
  return list.sort(sorters[state.sort] || sorters.rating);
}

function render() {
  const list = applyFilter();
  const grid = $('#grid');
  grid.innerHTML = list.map(cardHTML).join('');
  $('#empty').hidden = list.length > 0;
  $('#resultCount').textContent = list.length === DESTINATIONS.length
    ? '共 ' + DESTINATIONS.length + ' 个目的地'
    : '筛选出 ' + list.length + ' / ' + DESTINATIONS.length + ' 个目的地';

  syncMap(list);   /* 地图与卡片共用同一份筛选结果，两边永远一致 */
}

/* ---------- 初始化 ---------- */
function initChips() {
  $('#categoryChips').innerHTML = CATEGORIES.map((c) =>
    '<button class="chip' + (c === '全部' ? ' is-active' : '') + '" type="button" role="tab" data-cat="' + c + '" aria-selected="' + (c === '全部') + '">' + c + '</button>'
  ).join('');

  /* Hero 快捷标签：点击即搜索 */
  const quick = ['海岛', '古镇', '徒步', '亲子', '美食', '云海'];
  $('#heroChips').innerHTML = '<span class="chips-label">大家都在搜</span>' +
    quick.map((k) => '<button class="chip chip-ghost" type="button" data-kw="' + k + '">' + k + '</button>').join('');
}

function initStats() {
  const cities = new Set(DESTINATIONS.map((d) => d.region.split('·')[1].trim()));
  const avg = Math.round(DESTINATIONS.reduce((s, d) => s + (d.budgetMin + d.budgetMax) / 2, 0) / DESTINATIONS.length / 50) * 50;
  const items = [
    ['目的地', DESTINATIONS.length + ' 条'],
    ['覆盖城市', cities.size + ' 座'],
    ['人均预算中位值', money(avg)],
    ['交通圈', '2 小时内']
  ];
  $('#heroStats').innerHTML = items.map(([k, v]) =>
    '<div class="stat"><dt>' + k + '</dt><dd>' + v + '</dd></div>'
  ).join('');
}

function initEvents() {
  /* 封面照片加载失败 → 就地回退成 SVG 插画。
     用捕获阶段的全局 error 监听，代替内联 onerror：
     既不用把插画塞进 HTML 属性，也避开 CSP 对内联处理器的限制。
     注意必须传 true 走捕获阶段，img 的 error 不冒泡。 */
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.dataset || !img.dataset.coverId) return;
    const d = DESTINATIONS.filter((x) => x.id === img.dataset.coverId)[0];
    const holder = img.parentNode;
    if (!d || !holder) return;
    const kind = img.dataset.coverKind === 'wide' ? 'modal' : 'card';
    holder.insertAdjacentHTML('afterbegin', coverSVG(d, kind === 'modal' ? 'modal' : 'card', kind));
    img.remove();
  }, true);

  /* 主题筛选 */
  $('#categoryChips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    state.category = btn.dataset.cat;
    document.querySelectorAll('#categoryChips .chip').forEach((c) => {
      const on = c.dataset.cat === state.category;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-selected', String(on));
    });
    render();
  });

  /* 排序 */
  $('#sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value;
    render();
  });

  /* 搜索 */
  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.keyword = $('#searchInput').value;
    render();
    document.getElementById('destinations').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#searchInput').addEventListener('input', (e) => {
    state.keyword = e.target.value;
    render();
  });

  /* Hero 快捷标签 */
  $('#heroChips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-kw]');
    if (!btn) return;
    state.keyword = btn.dataset.kw;
    $('#searchInput').value = btn.dataset.kw;
    render();
    document.getElementById('destinations').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* 重置 */
  $('#resetBtn').addEventListener('click', () => {
    state.category = '全部';
    state.keyword = '';
    state.sort = 'rating';
    $('#searchInput').value = '';
    $('#sortSelect').value = 'rating';
    document.querySelectorAll('#categoryChips .chip').forEach((c) => {
      const on = c.dataset.cat === '全部';
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-selected', String(on));
    });
    render();
  });

  /* 打开详情 */
  $('#grid').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) openModal(card.dataset.id);
  });
  $('#grid').addEventListener('keydown', (e) => {
    const card = e.target.closest('.card');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openModal(card.dataset.id);
    }
  });

  /* 关闭详情 */
  $('#modal').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
  });

  /* 地图：清单项点开详情，全览按钮重新框选全部目的地 */
  $('#mapList').addEventListener('click', (e) => {
    const btn = e.target.closest('.map-item');
    if (btn) openModal(btn.dataset.id);
  });
  $('#mapReset').addEventListener('click', () => {
    if (mapState.map) fitToList(DESTINATIONS);
  });

  /* 位置示意图：点圆点开详情，悬停时右侧清单同步高亮（与在线地图同一套交互） */
  const sm = $('#mapStatic');
  if (sm) {
    sm.addEventListener('click', (e) => {
      const g = e.target.closest('.mstat-node');
      if (g && g.dataset.id && g.dataset.id !== HOME.id) openModal(g.dataset.id);
    });
    sm.addEventListener('keydown', (e) => {
      const g = e.target.closest('.mstat-node');
      if (g && g.dataset.id && g.dataset.id !== HOME.id && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        openModal(g.dataset.id);
      }
    });
    sm.addEventListener('mouseover', (e) => {
      const g = e.target.closest('.mstat-node');
      const id = g && g.dataset.id && g.dataset.id !== HOME.id ? g.dataset.id : '';
      if (id === mapState.hoverId) return;
      mapState.hoverId = id;
      document.querySelectorAll('#mapList .map-item').forEach((b) => {
        b.classList.toggle('is-hover', b.dataset.id === id);
      });
    });
  }

  /* 滚动阴影 */
  const onScroll = () => $('#siteHeader').classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 锚点滚动留出顶栏高度 */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: id === '#top' ? 0 : y, behavior: 'smooth' });
    });
  });
}

/* ---------- 弹层开关 ---------- */
let lastFocused = null;
function openModal(id) {
  const d = DESTINATIONS.find((x) => x.id === id);
  if (!d) return;
  const m = $('#modal');
  lastFocused = document.activeElement;
  $('#modalCover').innerHTML = coverHTML(d, 'modal', 'modal');
  $('#modalBody').innerHTML = modalHTML(d);
  m.hidden = false;
  /* 强制一次样式重算：先让 display 从 none 变成 flex，再加 .is-open，过渡才会真正播放。
     若两处改动落在同一次样式计算里，浏览器会直接跳到终态、看不到动画。 */
  void m.offsetWidth;
  m.classList.add('is-open');
  document.body.classList.add('modal-open');
  m.querySelector('.modal-close').focus();
}
function closeModal() {
  const m = $('#modal');
  if (m.hidden) return;
  m.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  setTimeout(() => { m.hidden = true; }, 220);
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

/* ---------- 启动 ---------- */
(function boot() {
  initChips();
  initStats();
  render();
  initEvents();
  initMap();
})();
