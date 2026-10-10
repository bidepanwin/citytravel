/* =========================================================
 * data.js — 目的地数据源
 * 纯前端演示：所有数值为整理值，可按需在 data.js 内直接修改。
 * 封面不使用位图，而是由 palette + scene 在现场生成 SVG 风景插画，
 * 因此完全离线可用、体积为零、无图片 404。
 * ======================================================= */

/* 可选封面类型：mountain | water | town | sea | forest | city */
const SCENE_LABELS = {
  mountain: '山地',
  water: '江湖',
  town: '古镇',
  sea: '海滨',
  forest: '森林',
  city: '城市'
};

const DESTINATIONS = [
  {
    id: 'moganshan',
    name: '莫干山',
    region: '浙江 · 湖州',
    area: '德清县',
    coord: [119.88, 30.60],
    category: '自然山水',
    tags: ['竹海', '民宿', '避暑', '骑行'],
    rating: 4.8,
    duration: '2 天 1 晚',
    budgetMin: 800,
    budgetMax: 1500,
    bestTime: '5–10月',
    scene: 'mountain',
    palette: ['#eaf3ea', '#d3e5d6', '#f4d9a8', '#b6cfae', '#8aae8d', '#5b7f66'],
    blurb: '竹海、老别墅与一整条山谷的民宿。傍晚在裸心谷附近走一圈，山风比空调管用。',
    highlights: [
      '清晨 6 点的竹海步道，人少、雾还没散',
      '老别墅群（民国建筑）沿山而建，摄影出片率高',
      '民宿密度全国领先，淡季可现场谈价',
      '山脚庾村文创市集，适合收尾'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午高铁至德清站，转景区接驳约 40 分钟', '下午竹海徒步 / 山地骑行', '傍晚入住民宿，山间晚餐'] },
      { day: 'Day 2', items: ['清晨看云海与日出', '上午老别墅群 + 剑池', '中午庾村市集，下午返程'] }
    ]
  },
  {
    id: 'qiandaohu',
    name: '千岛湖',
    region: '浙江 · 杭州',
    area: '淳安县',
    coord: [119.04, 29.61],
    category: '自然山水',
    tags: ['湖岛', '骑行', '露营', '亲子'],
    rating: 4.7,
    duration: '2–3 天',
    budgetMin: 600,
    budgetMax: 1200,
    bestTime: '4–10月',
    scene: 'water',
    palette: ['#eaf4f8', '#d2e8f1', '#ffe3b0', '#a9cbd6', '#7baabd', '#4a7b91'],
    blurb: '1078 个岛、一条环湖绿道和一个足够大的湖面。适合不想爬山、只想骑车吹风的人。',
    highlights: [
      '环湖绿道全程约 140 公里，可只骑最美的一段',
      '中心湖区码头游船，选「梅峰岛」线路视野最好',
      '湖畔露营区夜间光污染低，可观星',
      '有机鱼头是当地主食级存在'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午抵达千岛湖站，租车或租自行车', '下午环湖绿道骑行（推荐界首—排岭段）', '傍晚湖畔晚餐，鱼头汤必点'] },
      { day: 'Day 2', items: ['上午中心湖区游船登岛', '下午露营区扎营或返程（三日则留宿观星）'] }
    ]
  },
  {
    id: 'wuzhen',
    name: '乌镇',
    region: '浙江 · 嘉兴',
    area: '桐乡市',
    coord: [120.49, 30.74],
    category: '古镇水乡',
    tags: ['古镇', '夜景', '文艺', '戏剧'],
    rating: 4.6,
    duration: '1–2 天',
    budgetMin: 700,
    budgetMax: 1300,
    bestTime: '全年',
    scene: 'town',
    palette: ['#f3eee6', '#e6dccb', '#f7d9a0', '#c3b39a', '#9c8871', '#6b5a48'],
    blurb: '商业化最彻底，也最好逛的一座水乡。东栅看旧貌，西栅住一晚看灯。',
    highlights: [
      '西栅夜景是核心体验，20:00 后人流下降',
      '木心美术馆值得单独留 2 小时',
      '乌镇戏剧节期间（秋季）需提前 1 个月订房',
      '住景区内民宿可省去次日再次入园排队'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午抵达，东栅半日（原住民区、老作坊）', '下午转西栅办理入住', '傍晚至夜间：西栅夜景 + 木心美术馆'] },
      { day: 'Day 2', items: ['清晨 7 点前的西栅石板街几乎无人', '上午自由逛，中午返程'] }
    ]
  },
  {
    id: 'xitang',
    name: '西塘',
    region: '浙江 · 嘉兴',
    area: '嘉善县',
    coord: [120.80, 30.94],
    category: '古镇水乡',
    tags: ['古镇', '廊棚', '摄影', '夜生活'],
    rating: 4.5,
    duration: '1–2 天',
    budgetMin: 500,
    budgetMax: 1000,
    bestTime: '3–6·9–11月',
    scene: 'town',
    palette: ['#f5efe8', '#e9dccf', '#f6d6a6', '#c9b49c', '#a0866c', '#6f5a48'],
    blurb: '最长的临河廊棚，雨天也能一路走到底。夜里比乌镇热闹，适合不早睡的人。',
    highlights: [
      '烟雨长廊全长近千米，雨天体验反而更好',
      '石皮弄是最窄的一条巷，仅容一人通过',
      '夜间的河边酒吧街是本地特色',
      '西塘到嘉善南站约 20 分钟，交通成本低'
    ],
    itinerary: [
      { day: 'Day 1', items: ['下午抵达，入住临河客栈', '傍晚烟雨长廊 + 送子来凤桥', '夜间河边酒吧街或直接睡'] },
      { day: 'Day 2', items: ['清晨河雾与摇橹船', '上午逛石皮弄、西园，返程'] }
    ]
  },
  {
    id: 'nanxun',
    name: '南浔古镇',
    region: '浙江 · 湖州',
    area: '南浔区',
    coord: [120.43, 30.87],
    category: '古镇水乡',
    tags: ['古镇', '园林', '人文', '安静'],
    rating: 4.6,
    duration: '1–2 天',
    budgetMin: 500,
    budgetMax: 900,
    bestTime: '3–5·9–11月',
    scene: 'town',
    palette: ['#f1f0e8', '#e2e2d4', '#f7dcae', '#c0bfa4', '#94947c', '#63645a'],
    blurb: '人最少的一座水乡。中西合璧的巨宅和小莲庄，看的是「有钱人家怎么住」。',
    highlights: [
      '小莲庄园林规模在水乡里属顶配',
      '张石铭旧宅里的西洋舞厅，混搭感很强',
      '游客密度显著低于乌镇、西塘',
      '百间楼沿河民居基本保留原生生活状态'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午抵达南浔站', '下午小莲庄 + 嘉业堂藏书楼', '傍晚百间楼沿河散步'] },
      { day: 'Day 2', items: ['上午张石铭旧宅、刘氏梯号', '中午古镇内用饭，下午返程'] }
    ]
  },
  {
    id: 'suzhou',
    name: '苏州',
    region: '江苏 · 苏州',
    area: '姑苏区',
    coord: [120.62, 31.30],
    category: '城市人文',
    tags: ['园林', '博物馆', '美食', 'City Walk'],
    rating: 4.8,
    duration: '2 天',
    budgetMin: 900,
    budgetMax: 1600,
    bestTime: '3–5·10–11月',
    scene: 'city',
    palette: ['#f4f1ec', '#e6e2d9', '#f8dcae', '#cbc7bb', '#a3a096', '#6e6d66'],
    blurb: '高铁 40 分钟可达的城市旅行天花板。园林要早看，苏帮菜要晚吃。',
    highlights: [
      '拙政园建议 7:30 开园即入，9 点后基本看人',
      '苏州博物馆需提前 7 天线上预约',
      '平江路历史街区适合傍晚 City Walk',
      '面馆文化：头汤面在早上 6–8 点最好'
    ],
    itinerary: [
      { day: 'Day 1', items: ['早班高铁抵达，先吃一碗头汤面', '上午拙政园 + 苏州博物馆', '下午平江路，晚上苏帮菜（松鼠鳜鱼）'] },
      { day: 'Day 2', items: ['上午留园或网师园（小而精）', '下午金鸡湖现代街区，傍晚返杭'] }
    ]
  },
  {
    id: 'huangshan',
    name: '黄山',
    region: '安徽 · 黄山',
    area: '黄山区',
    coord: [118.17, 30.13],
    category: '徒步登山',
    tags: ['云海', '日出', '登山', '摄影'],
    rating: 4.9,
    duration: '2–3 天',
    budgetMin: 1200,
    budgetMax: 2200,
    bestTime: '4–5·9–11月',
    scene: 'mountain',
    palette: ['#e9eef2', '#d5dfe8', '#ffdcae', '#aebcc9', '#7f92a4', '#4d5f72'],
    blurb: '体力换风景的典型。索道能省一半路程，但真正的云海只在山上住一晚才看得到。',
    highlights: [
      '山上住一晚是看日出的唯一现实方案，需提前订',
      '西海大峡谷为精华段，单向通行注意体力分配',
      '雨后初晴的云海概率最高',
      '冬季（12–2 月）人少，雪景另有一番观感'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午高铁至黄山北站，转景区大巴', '下午云谷索道上山，北海景区', '宿山上酒店，看日落'] },
      { day: 'Day 2', items: ['清晨光明顶看日出', '上午西海大峡谷 → 莲花峰方向', '下午玉屏索道下山，返程'] }
    ]
  },
  {
    id: 'nanxijiang',
    name: '楠溪江',
    region: '浙江 · 温州',
    area: '永嘉县',
    coord: [120.69, 28.15],
    category: '自然山水',
    tags: ['漂流', '古村', '慢生活', '溪流'],
    rating: 4.6,
    duration: '2 天',
    budgetMin: 600,
    budgetMax: 1100,
    bestTime: '5–10月',
    scene: 'water',
    palette: ['#eef4ee', '#dbeadf', '#f8dfb2', '#b4cfc0', '#84ab9a', '#517a6c'],
    blurb: '一条清澈到能看见河底的江，两岸是宋以来的古村落。适合懒得爬山但想下水的人。',
    highlights: [
      '狮子岩竹筏漂流是最经典的一段',
      '苍坡村、芙蓉村按「文房四宝」布局，值得看',
      '溪水 7–9 月水温适宜，可直接下水',
      '沿岸自驾路况好，随停随玩'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午抵达永嘉，自驾沿江而上', '下午狮子岩竹筏漂流', '傍晚入住江边民宿'] },
      { day: 'Day 2', items: ['上午苍坡村 + 芙蓉古村', '中午溪鱼午餐，下午返程'] }
    ]
  },
  {
    id: 'dongji',
    name: '东极岛',
    region: '浙江 · 舟山',
    area: '普陀区',
    coord: [122.66, 30.10],
    category: '海岛',
    tags: ['海岛', '日出', '露营', '渔村'],
    rating: 4.7,
    duration: '2–3 天',
    budgetMin: 900,
    budgetMax: 1600,
    bestTime: '6–9月',
    scene: 'sea',
    palette: ['#eaf4f7', '#d3e9f0', '#ffe0ad', '#a6cbd8', '#6fa6bd', '#3f7590'],
    blurb: '中国大陆最东端的人居岛屿之一。船程本身就是风景，但晕船的人要有心理准备。',
    highlights: [
      '庙子湖岛灯塔是标准机位，日落方向最佳',
      '东福山岛可看「第一缕阳光」，需转岛航班',
      '船票极紧张，务必提前 3–5 天抢',
      '夏季偶有台风导致停航，出行前查航班动态'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午沈家门半升洞码头乘船（约 2 小时）', '下午庙子湖岛环岛徒步', '傍晚灯塔看日落，宿岛上'] },
      { day: 'Day 2', items: ['清晨看日出', '上午转东福山岛或海钓', '下午返程（三日则多留一晚）'] }
    ]
  },
  {
    id: 'anji',
    name: '安吉',
    region: '浙江 · 湖州',
    area: '安吉县',
    coord: [119.68, 30.64],
    category: '亲子',
    tags: ['竹海', '漂流', '露营', '研学'],
    rating: 4.5,
    duration: '2 天',
    budgetMin: 600,
    budgetMax: 1200,
    bestTime: '5–10月',
    scene: 'forest',
    palette: ['#edf5e9', '#d8ead3', '#f9e2b0', '#b3d0a6', '#84ae83', '#4f7a5f'],
    blurb: '竹海、溪流和一堆为小孩设计的营地。带娃出行的省心选项，成人也不会觉得无聊。',
    highlights: [
      '中国大竹海是《卧虎藏龙》取景地之一',
      'Hellokitty 乐园适合 3–10 岁',
      '溪龙乡一带露营地成熟，可拎包入住',
      '夏季峡谷漂流落差适中，适合亲子'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午抵达安吉，前往大竹海', '下午峡谷漂流', '傍晚露营地烧烤'] },
      { day: 'Day 2', items: ['上午乐园或溪边玩水', '中午农家菜，下午返程'] }
    ]
  },
  {
    id: 'tianmushan',
    name: '天目山',
    region: '浙江 · 杭州',
    area: '临安区',
    coord: [119.43, 30.34],
    category: '徒步登山',
    tags: ['森林', '徒步', '避暑', '古树'],
    rating: 4.6,
    duration: '2 天',
    budgetMin: 500,
    budgetMax: 900,
    bestTime: '6–9月',
    scene: 'forest',
    palette: ['#eaf2ee', '#d5e6dd', '#f5dfb4', '#a9c8b6', '#7aa48d', '#486e5c'],
    blurb: '离杭州最近的避暑森林。山上比市区低 6–8℃，古柳杉群落是真的老。',
    highlights: [
      '大树王与柳杉群落树龄普遍超过千年',
      '夏季山间温度比杭州城区低 6–8℃',
      '禅源寺一带可短住，晨钟氛围好',
      '自驾 1.5 小时可达，是最近的山'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午自驾至天目山', '下午禅源寺 → 大树王徒步', '傍晚山间住宿'] },
      { day: 'Day 2', items: ['清晨林间散步', '上午开山老殿方向', '中午下山，下午返程'] }
    ]
  },
  {
    id: 'wuyuan',
    name: '婺源',
    region: '江西 · 上饶',
    area: '婺源县',
    coord: [117.86, 29.25],
    category: '古镇水乡',
    tags: ['徽派', '田园', '油菜花', '摄影'],
    rating: 4.7,
    duration: '2–3 天',
    budgetMin: 800,
    budgetMax: 1400,
    bestTime: '3–4·11月',
    scene: 'town',
    palette: ['#f7f2e6', '#ece3cc', '#ffd98f', '#cdbd93', '#a89467', '#6f6042'],
    blurb: '三月是油菜花配白墙黑瓦，十一月是晒秋配红枫。同一片村子，两个季节两种拍法。',
    highlights: [
      '江岭梯田花海（3 月中下旬）是核心场景',
      '篁岭晒秋（10 月下旬–11 月）色彩最浓',
      '村落分散，建议包车或自驾',
      '淡季人极少，反而更接近生活状态'
    ],
    itinerary: [
      { day: 'Day 1', items: ['上午高铁至婺源站', '下午篁岭（索道上山）', '傍晚宿篁岭或县城'] },
      { day: 'Day 2', items: ['清晨江岭梯田看晨雾', '上午李坑、汪口古村', '下午返程（三日可加思溪延村）'] }
    ]
  }
];

/* =========================================================
 * 封面照片
 * 来源：Pexels（Pexels License —— 免版权、可商用、无需署名；此处仍标注摄影师）。
 * 全部已本地化到 assets/img/，因此离线可用，也不会被防盗链拦掉。
 *
 * match 说明照片与目的地的真实关系，会显示为卡片角标，避免误导：
 *   exact   = 该景点本尊
 *   similar = 同类景观示意（免版权图库里没有该景点的本尊照片）
 *   region  = 同区域景观示意
 * ======================================================= */
const PHOTOS = {
  moganshan:  { by: 'Daven Hsu',         src: 'https://www.pexels.com/photo/34940109/', match: 'similar', note: '竹海步道' },
  qiandaohu:  { by: 'Zhicheng Zhang',    src: 'https://www.pexels.com/photo/17754422/', match: 'exact',   note: '' },
  wuzhen:     { by: 'Relaxing Journeys', src: 'https://www.pexels.com/photo/37015406/', match: 'exact',   note: '' },
  xitang:     { by: 'Vindli',            src: 'https://www.pexels.com/photo/16569546/', match: 'exact',   note: '' },
  nanxun:     { by: 'luoqing',           src: 'https://www.pexels.com/photo/29372780/', match: 'similar', note: '江南水乡' },
  suzhou:     { by: 'Garrison Gao',      src: 'https://www.pexels.com/photo/36466076/', match: 'exact',   note: '' },
  huangshan:  { by: 'Pexels 摄影师',      src: 'https://www.pexels.com/photo/34753701/', match: 'exact',   note: '' },
  nanxijiang: { by: 'laole',             src: 'https://www.pexels.com/photo/2620702/',  match: 'similar', note: '江面群山' },
  dongji:     { by: 'Greece China News', src: 'https://www.pexels.com/photo/38243739/', match: 'region',  note: '舟山群岛' },
  anji:       { by: 'Jenkin Shen',       src: 'https://www.pexels.com/photo/32990902/', match: 'similar', note: '竹海' },
  tianmushan: { by: 'Yifan Lai',         src: 'https://www.pexels.com/photo/26200481/', match: 'similar', note: '雾中森林' },
  wuyuan:     { by: 'hujason',           src: 'https://www.pexels.com/photo/29612001/', match: 'exact',   note: '' }
};

DESTINATIONS.forEach((d) => {
  const p = PHOTOS[d.id];
  if (!p) return;
  d.photo = {
    card: 'assets/img/' + d.id + '-card.jpg',
    wide: 'assets/img/' + d.id + '-wide.jpg',
    by: p.by,
    src: p.src,
    match: p.match,
    note: p.note
  };
});

/* 非「本尊」照片的角标文案（exact 为空 → 不显示角标） */
const PHOTO_MATCH_LABEL = { exact: '', similar: '同类景观示意', region: '同区域示意' };

/* 主题筛选项（顺序即展示顺序） */
const CATEGORIES = ['全部', '自然山水', '古镇水乡', '海岛', '徒步登山', '亲子', '城市人文'];
