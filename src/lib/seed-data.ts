import clientPromise from './mongodb'

// 漢字テスト問題データ
const kanjiQuestions = [
  // 1年生
  {
    grade: 1,
    question: "この漢字の読み方はどれですか？「日」",
    options: ["ひ", "つき", "みず", "き"],
    correctAnswer: "ひ",
    kanji: "日",
    meaning: "ひ、日"
  },
  {
    grade: 1,
    question: "この漢字の読み方はどれですか？「山」",
    options: ["やま", "かわ", "き", "つち"],
    correctAnswer: "やま",
    kanji: "山",
    meaning: "やま、山"
  },
  {
    grade: 1,
    question: "この漢字の読み方はどれですか？「水」",
    options: ["みず", "ひ", "き", "つち"],
    correctAnswer: "みず",
    kanji: "水",
    meaning: "みず、水"
  },
  {
    grade: 1,
    question: "この漢字の読み方はどれですか？「火」",
    options: ["ひ", "みず", "き", "つち"],
    correctAnswer: "ひ",
    kanji: "火",
    meaning: "ひ、火"
  },
  {
    grade: 1,
    question: "この漢字の読み方はどれですか？「木」",
    options: ["き", "かわ", "やま", "つち"],
    correctAnswer: "き",
    kanji: "木",
    meaning: "き、木"
  },
  {
    grade: 1,
    question: "この漢字の読み方はどれですか？「人」",
    options: ["ひと", "いり", "おお", "てん"],
    correctAnswer: "ひと",
    kanji: "人",
    meaning: "ひと、人"
  },
  {
    grade: 1,
    question: "この漢字の読み方はどれですか？「月」",
    options: ["つき", "ひ", "ほし", "そら"],
    correctAnswer: "つき",
    kanji: "月",
    meaning: "つき、月"
  },
  {
    grade: 1,
    question: "この漢字の読み方はどれですか？「川」",
    options: ["かわ", "やま", "き", "つち"],
    correctAnswer: "かわ",
    kanji: "川",
    meaning: "かわ、川"
  },

  // 2年生
  {
    grade: 2,
    question: "この漢字の読み方はどれですか？「天」",
    options: ["てん", "ち", "うえ", "した"],
    correctAnswer: "てん",
    kanji: "天",
    meaning: "てん、天"
  },
  {
    grade: 2,
    question: "この漢字の読み方はどれですか？「地」",
    options: ["ち", "てん", "うえ", "した"],
    correctAnswer: "ち",
    kanji: "地",
    meaning: "ち、地"
  },
  {
    grade: 2,
    question: "この漢字の読み方はどれですか？「上」",
    options: ["うえ", "した", "なか", "そと"],
    correctAnswer: "うえ",
    kanji: "上",
    meaning: "うえ、上"
  },
  {
    grade: 2,
    question: "この漢字の読み方はどれですか？「下」",
    options: ["した", "うえ", "なか", "そと"],
    correctAnswer: "した",
    kanji: "下",
    meaning: "した、下"
  },
  {
    grade: 2,
    question: "この漢字の読み方はどれですか？「中」",
    options: ["なか", "ひだり", "みぎ", "そと"],
    correctAnswer: "なか",
    kanji: "中",
    meaning: "なか、中"
  },
  {
    grade: 2,
    question: "この漢字の読み方はどれですか？「花」",
    options: ["はな", "くさ", "き", "は"],
    correctAnswer: "はな",
    kanji: "花",
    meaning: "はな、花"
  },
  {
    grade: 2,
    question: "この漢字の読み方はどれですか？「雨」",
    options: ["あめ", "ゆき", "かぜ", "くも"],
    correctAnswer: "あめ",
    kanji: "雨",
    meaning: "あめ、雨"
  },
  {
    grade: 2,
    question: "この漢字の読み方はどれですか？「空」",
    options: ["そら", "あめ", "くも", "かぜ"],
    correctAnswer: "そら",
    kanji: "空",
    meaning: "そら、空"
  },

  // 3年生
  {
    grade: 3,
    question: "この漢字の読み方はどれですか？「音楽」",
    options: ["おんがく", "うたごえ", "おどり", "えんそう"],
    correctAnswer: "おんがく",
    kanji: "音楽",
    meaning: "おんがく、音楽"
  },
  {
    grade: 3,
    question: "この漢字の読み方はどれですか？「時間」",
    options: ["じかん", "ふんびょう", "とけい", "にちじ"],
    correctAnswer: "じかん",
    kanji: "時間",
    meaning: "じかん、時間"
  },
  {
    grade: 3,
    question: "この漢字の読み方はどれですか？「教室」",
    options: ["きょうしつ", "がっこう", "べんきょう", "せんせい"],
    correctAnswer: "きょうしつ",
    kanji: "教室",
    meaning: "きょうしつ、教室"
  },
  {
    grade: 3,
    question: "この漢字の読み方はどれですか？「勉強」",
    options: ["べんきょう", "きょうしつ", "がっこう", "せんせい"],
    correctAnswer: "べんきょう",
    kanji: "勉強",
    meaning: "べんきょう、勉強"
  },
  {
    grade: 3,
    question: "この漢字の読み方はどれですか？「友達」",
    options: ["ともだち", "かぞく", "せんせい", "きょうだい"],
    correctAnswer: "ともだち",
    kanji: "友達",
    meaning: "ともだち、友達"
  },
  {
    grade: 3,
    question: "この漢字の読み方はどれですか？「運動」",
    options: ["うんどう", "たいそう", "すぽーつ", "げーむ"],
    correctAnswer: "うんどう",
    kanji: "運動",
    meaning: "うんどう、運動"
  },

  // 4年生
  {
    grade: 4,
    question: "この漢字の読み方はどれですか？「新聞」",
    options: ["しんぶん", "ざっし", "てがみ", "しょるい"],
    correctAnswer: "しんぶん",
    kanji: "新聞",
    meaning: "しんぶん、新聞"
  },
  {
    grade: 4,
    question: "この漢字の読み方はどれですか？「電車」",
    options: ["でんしゃ", "じどうしゃ", "ひこうき", "ふね"],
    correctAnswer: "でんしゃ",
    kanji: "電車",
    meaning: "でんしゃ、電車"
  },
  {
    grade: 4,
    question: "この漢字の読み方はどれですか？「図書館」",
    options: ["としょかん", "びじゅつかん", "はくぶつかん", "えいがかん"],
    correctAnswer: "としょかん",
    kanji: "図書館",
    meaning: "としょかん、図書館"
  },
  {
    grade: 4,
    question: "この漢字の読み方はどれですか？「辞書」",
    options: ["じしょ", "ほん", "しんぶん", "ざっし"],
    correctAnswer: "じしょ",
    kanji: "辞書",
    meaning: "じしょ、辞書"
  },
  {
    grade: 4,
    question: "この漢字の読み方はどれですか？「病院」",
    options: ["びょういん", "がっこう", "こうえん", "えき"],
    correctAnswer: "びょういん",
    kanji: "病院",
    meaning: "びょういん、病院"
  },
  {
    grade: 4,
    question: "この漢字の読み方はどれですか？「警察」",
    options: ["けいさつ", "しょうぼう", "ゆうびん", "ぎんこう"],
    correctAnswer: "けいさつ",
    kanji: "警察",
    meaning: "けいさつ、警察"
  },

  // 5年生
  {
    grade: 5,
    question: "この漢字の読み方はどれですか？「環境」",
    options: ["かんきょう", "しゅうい", "しぜん", "じょうたい"],
    correctAnswer: "かんきょう",
    kanji: "環境",
    meaning: "かんきょう、環境"
  },
  {
    grade: 5,
    question: "この漢字の読み方はどれですか？「生活」",
    options: ["せいかつ", "じんせい", "くらし", "ひび"],
    correctAnswer: "せいかつ",
    kanji: "生活",
    meaning: "せいかつ、生活"
  },
  {
    grade: 5,
    question: "この漢字の読み方はどれですか？「健康」",
    options: ["けんこう", "げんき", "たいりょく", "じょうぶ"],
    correctAnswer: "けんこう",
    kanji: "健康",
    meaning: "けんこう、健康"
  },
  {
    grade: 5,
    question: "この漢字の読み方はどれですか？「経験」",
    options: ["けいけん", "たいけん", "べんきょう", "ちしき"],
    correctAnswer: "けいけん",
    kanji: "経験",
    meaning: "けいけん、経験"
  },
  {
    grade: 5,
    question: "この漢字の読み方はどれですか？「技術」",
    options: ["ぎじゅつ", "のうりょく", "ちから", "わざ"],
    correctAnswer: "ぎじゅつ",
    kanji: "技術",
    meaning: "ぎじゅつ、技術"
  },
  {
    grade: 5,
    question: "この漢字の読み方はどれですか？「政治」",
    options: ["せいじ", "せいふ", "こっか", "しゃかい"],
    correctAnswer: "せいじ",
    kanji: "政治",
    meaning: "せいじ、政治"
  },

  // 6年生
  {
    grade: 6,
    question: "この漢字の読み方はどれですか？「正義」",
    options: ["せいぎ", "こうへい", "どうとく", "りんり"],
    correctAnswer: "せいぎ",
    kanji: "正義",
    meaning: "せいぎ、正義"
  },
  {
    grade: 6,
    question: "この漢字の読み方はどれですか？「協力」",
    options: ["きょうりょく", "てつだい", "えんじょ", "しえん"],
    correctAnswer: "きょうりょく",
    kanji: "協力",
    meaning: "きょうりょく、協力"
  },
  {
    grade: 6,
    question: "この漢字の読み方はどれですか？「将来」",
    options: ["しょうらい", "みらい", "ぜんと", "てんぼう"],
    correctAnswer: "しょうらい",
    kanji: "将来",
    meaning: "しょうらい、将来"
  },
  {
    grade: 6,
    question: "この漢字の読み方はどれですか？「責任」",
    options: ["せきにん", "ぎむ", "やくめ", "しごと"],
    correctAnswer: "せきにん",
    kanji: "責任",
    meaning: "せきにん、責任"
  },
  {
    grade: 6,
    question: "この漢字の読み方はどれですか？「議論」",
    options: ["ぎろん", "はなし", "かいぎ", "そうだん"],
    correctAnswer: "ぎろん",
    kanji: "議論",
    meaning: "ぎろん、議論"
  },
  {
    grade: 6,
    question: "この漢字の読み方はどれですか？「貴重」",
    options: ["きちょう", "たいせつ", "ひつよう", "じゅうよう"],
    correctAnswer: "きちょう",
    kanji: "貴重",
    meaning: "きちょう、貴重"
  }
]

// 読解テスト問題データ
const readingQuestions = [
  {
    level: 1,
    passage: "Once upon a time, in a cozy little cottage nestled beside a whispering forest, lived a cheerful girl named Lily.",
    question: "Where does Lily live?",
    options: ["In a bustling city", "In a cozy cottage by a forest", "In a castle on a hill"],
    correctAnswer: "In a cozy cottage by a forest"
  },
  {
    level: 2,
    passage: "In the heart of the enchanted forest, where ancient trees whispered secrets to the wind, lived a young boy named Alex.",
    question: "What is Alex known for?",
    options: ["His bravery and kindness", "His magical powers", "His ability to talk to animals"],
    correctAnswer: "His bravery and kindness"
  }
]

// 拡充された書籍データ
const sampleBooks = [
  // フィクション - 低学年
  {
    title: "魔法の森の大冒険",
    author: "田中太郎",
    description: "小学生のミカちゃんが魔法の森で動物たちと友達になる物語",
    kanjiLevel: "低学年",
    readingLevel: 1,
    genres: ["fantasy"],
    keywords: ["魔法", "冒険", "友情", "動物", "森"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "サッカー少年タケシ",
    author: "山田花子",
    description: "サッカーが大好きな少年の友情と成長の物語",
    kanjiLevel: "低学年",
    readingLevel: 2,
    genres: ["slice-of-life"],
    keywords: ["サッカー", "友情", "学校", "スポーツ", "仲間"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "夏休みのわくわく探検隊",
    author: "佐藤次郎",
    description: "夏休みに仲間と一緒に近所を探検する楽しい冒険",
    kanjiLevel: "低学年",
    readingLevel: 1,
    genres: ["slice-of-life"],
    keywords: ["夏休み", "冒険", "友情", "探検", "仲間"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "うさぎとかめの大レース",
    author: "鈴木みどり",
    description: "みんなで力を合わせる大切さを学ぶ動物たちの物語",
    kanjiLevel: "低学年",
    readingLevel: 1,
    genres: ["slice-of-life"],
    keywords: ["動物", "友情", "協力", "頑張る"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "歴史冒険！江戸の町へタイムスリップ",
    author: "時代劇作家",
    description: "現代の子どもが江戸時代にタイムスリップして、実際の歴史を体験する物語",
    kanjiLevel: "低学年",
    readingLevel: 3,
    genres: ["fantasy", "history"],
    keywords: ["タイムスリップ", "江戸時代", "歴史", "冒険", "学習"],
    isFiction: true,
    isNonfiction: true,  // フィクション兼ノンフィクション（歴史学習要素）
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },

  // ノンフィクション - 低学年
  {
    title: "恐竜の世界を探検しよう",
    author: "佐藤花子",
    description: "恐竜の生態と化石について学ぶ科学の本",
    kanjiLevel: "低学年",
    readingLevel: 1,
    genres: ["science"],
    keywords: ["恐竜", "化石", "科学", "発見", "古代"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "宇宙のふしぎ大発見",
    author: "星野宙男",
    description: "太陽系の惑星や宇宙について楽しく学べる本",
    kanjiLevel: "低学年",
    readingLevel: 2,
    genres: ["science"],
    keywords: ["宇宙", "星", "惑星", "科学", "発見"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "どうぶつえんのひみつ",
    author: "動物研太",
    description: "動物園の動物たちの生活と飼育員さんのお仕事",
    kanjiLevel: "低学年",
    readingLevel: 1,
    genres: ["science"],
    keywords: ["動物", "動物園", "仕事", "生活"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },

  // フィクション - 中学年
  {
    title: "名探偵コナンと謎の暗号",
    author: "推理作家",
    description: "小学生探偵が学校で起きた不思議な事件を解決する",
    kanjiLevel: "中学年",
    readingLevel: 2,
    genres: ["mystery"],
    keywords: ["推理", "謎解き", "学校", "事件", "暗号"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "料理の国の魔法使い",
    author: "キッチン魔女",
    description: "料理が大好きな少女が魔法の力で美味しい料理を作る",
    kanjiLevel: "中学年",
    readingLevel: 2,
    genres: ["fantasy"],
    keywords: ["魔法", "料理", "食べ物", "冒険", "友情"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "音楽の妖精と歌の力",
    author: "メロディー作家",
    description: "音楽の力で世界を救う少年の冒険",
    kanjiLevel: "中学年",
    readingLevel: 3,
    genres: ["fantasy"],
    keywords: ["音楽", "歌", "魔法", "冒険", "仲間"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "家族みんなでキャンプ",
    author: "アウトドア太郎",
    description: "家族でキャンプに行って自然の中で過ごす楽しい体験",
    kanjiLevel: "中学年",
    readingLevel: 1,
    genres: ["slice-of-life"],
    keywords: ["家族", "キャンプ", "自然", "アウトドア", "夏休み"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "科学と友達！実験冒険物語",
    author: "科学冒険家",
    description: "主人公が様々な科学実験を通して冒険する物語。実際の科学知識も学べる",
    kanjiLevel: "中学年",
    readingLevel: 3,
    genres: ["fantasy", "science"],
    keywords: ["科学", "実験", "冒険", "学習", "発見"],
    isFiction: true,
    isNonfiction: true,  // フィクション兼ノンフィクション（科学学習要素）
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },

  // ノンフィクション - 中学年
  {
    title: "江戸時代のくらしと文化",
    author: "歴史研究者",
    description: "江戸時代の人々の生活や文化について詳しく解説",
    kanjiLevel: "中学年",
    readingLevel: 2,
    genres: ["history"],
    keywords: ["歴史", "江戸", "文化", "生活", "昔"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "科学実験で遊ぼう",
    author: "実験博士",
    description: "家でできる簡単で楽しい科学実験を紹介",
    kanjiLevel: "中学年",
    readingLevel: 1,
    genres: ["science"],
    keywords: ["科学", "実験", "研究", "発見", "理科"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "世界の国々とその文化",
    author: "世界探検家",
    description: "世界各国の文化や習慣について学ぶ",
    kanjiLevel: "中学年",
    readingLevel: 3,
    genres: ["history"],
    keywords: ["世界", "文化", "国", "習慣", "地理"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },

  // フィクション - 高学年
  {
    title: "タイムトラベラーの大冒険",
    author: "時間旅行者",
    description: "時空を超えて歴史上の出来事を体験する少年の物語",
    kanjiLevel: "高学年",
    readingLevel: 2,
    genres: ["fantasy", "history"],
    keywords: ["タイムトラベル", "歴史", "冒険", "時間", "過去"],
    isFiction: true,
    isNonfiction: true,  // フィクション兼ノンフィクション（歴史学習要素）
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },
  {
    title: "絵描きになりたい少女",
    author: "アート先生",
    description: "絵が大好きな少女の成長と夢への挑戦",
    kanjiLevel: "高学年",
    readingLevel: 1,
    genres: ["slice-of-life"],
    keywords: ["絵", "アート", "夢", "成長", "努力"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },
  {
    title: "宇宙探検隊の使命",
    author: "SF作家",
    description: "未来の宇宙飛行士たちが新たな惑星を探検する",
    kanjiLevel: "高学年",
    readingLevel: 3,
    genres: ["fantasy", "science"],
    keywords: ["宇宙", "探検", "惑星", "未来", "科学"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },

  // ノンフィクション - 高学年
  {
    title: "戦国武将の生き様",
    author: "歴史学者",
    description: "戦国時代の有名な武将たちの生涯と業績",
    kanjiLevel: "高学年",
    readingLevel: 2,
    genres: ["history"],
    keywords: ["歴史", "戦国", "武将", "伝記", "日本"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },
  {
    title: "発明家たちの挑戦",
    author: "技術研究者",
    description: "世界を変えた発明家たちの努力と発見の物語",
    kanjiLevel: "高学年",
    readingLevel: 1,
    genres: ["science", "history"],
    keywords: ["発明", "科学", "技術", "研究", "努力"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },
  {
    title: "地球環境を守ろう",
    author: "環境学者",
    description: "環境問題と私たちにできることについて考える",
    kanjiLevel: "高学年",
    readingLevel: 3,
    genres: ["science"],
    keywords: ["環境", "地球", "自然", "保護", "未来"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  }
]

// 小学館の書籍データ
const shogakukanBooks = [
  // フィクション - 低学年
  {
    title: "【小学館】ドラえもんと夢の大冒険",
    author: "藤子・F・不二雄",
    description: "ドラえもんとのび太が22世紀の未来道具で大冒険する物語",
    kanjiLevel: "低学年",
    readingLevel: 1,
    genres: ["fantasy"],
    keywords: ["ドラえもん", "冒険", "友情", "未来", "道具"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "【小学館】コロコロコミックのヒーローたち",
    author: "コロコロ編集部",
    description: "みんなが大好きなコロコロコミックのキャラクターが大集合",
    kanjiLevel: "低学年",
    readingLevel: 2,
    genres: ["slice-of-life"],
    keywords: ["漫画", "ヒーロー", "友情", "冒険", "楽しい"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "【小学館】きかんしゃトーマスの島の仲間たち",
    author: "小学館編集部",
    description: "ソドー島で働く機関車トーマスと仲間たちの心温まる物語",
    kanjiLevel: "低学年",
    readingLevel: 1,
    genres: ["slice-of-life"],
    keywords: ["機関車", "友情", "仕事", "協力", "島"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "【小学館】ポケモンと始める大冒険",
    author: "ポケモン出版編集部",
    description: "ポケモンマスターを目指す少年サトシの冒険の旅",
    kanjiLevel: "低学年",
    readingLevel: 2,
    genres: ["fantasy"],
    keywords: ["ポケモン", "冒険", "友情", "バトル", "成長"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "【小学館】科学マジック大作戦",
    author: "マジック科学研究所",
    description: "マジックを通して科学の不思議を学ぶ冒険ストーリー",
    kanjiLevel: "低学年",
    readingLevel: 3,
    genres: ["fantasy", "science"],
    keywords: ["マジック", "科学", "実験", "冒険", "学習"],
    isFiction: true,
    isNonfiction: true,  // フィクション兼ノンフィクション（科学学習要素）
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },

  // ノンフィクション - 低学年
  {
    title: "【小学館】恐竜大図鑑",
    author: "恐竜研究会",
    description: "色鮮やかな写真とイラストで恐竜の世界を楽しく学ぼう",
    kanjiLevel: "低学年",
    readingLevel: 1,
    genres: ["science"],
    keywords: ["恐竜", "図鑑", "化石", "古代", "科学"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },
  {
    title: "【小学館】動物のくらし大百科",
    author: "動物研究所",
    description: "世界中の動物たちの不思議な生態を写真で紹介",
    kanjiLevel: "低学年",
    readingLevel: 2,
    genres: ["science"],
    keywords: ["動物", "生態", "自然", "写真", "百科"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 6, max: 8 },
    difficulty: "易",
    createdAt: new Date()
  },

  // フィクション - 中学年
  {
    title: "【小学館】名探偵コナンの推理ファイル",
    author: "青山剛昌",
    description: "江戸川コナンが難事件を科学の力で解決する推理小説",
    kanjiLevel: "中学年",
    readingLevel: 2,
    genres: ["mystery"],
    keywords: ["推理", "科学", "事件", "謎解き", "探偵"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "【小学館】少年サンデー傑作選",
    author: "サンデー編集部",
    description: "少年サンデーの人気作品から選りすぐりの名作を収録",
    kanjiLevel: "中学年",
    readingLevel: 3,
    genres: ["slice-of-life"],
    keywords: ["漫画", "友情", "成長", "青春", "冒険"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "【小学館】ちびまる子ちゃんの楽しい日常",
    author: "さくらももこ",
    description: "まる子とクラスメイトたちの笑いと涙の日常生活",
    kanjiLevel: "中学年",
    readingLevel: 1,
    genres: ["slice-of-life"],
    keywords: ["日常", "学校", "家族", "友達", "笑い"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },

  // ノンフィクション - 中学年
  {
    title: "【小学館】日本の歴史人物伝",
    author: "歴史編集委員会",
    description: "織田信長から坂本龍馬まで、日本史の偉人たちの生涯",
    kanjiLevel: "中学年",
    readingLevel: 2,
    genres: ["history"],
    keywords: ["歴史", "人物", "伝記", "日本", "偉人"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "【小学館】科学のふしぎ実験室",
    author: "実験科学研究所",
    description: "身近な材料でできる楽しい科学実験とその仕組み",
    kanjiLevel: "中学年",
    readingLevel: 1,
    genres: ["science"],
    keywords: ["科学", "実験", "理科", "発見", "研究"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },
  {
    title: "【小学館】歴史ミステリー！戦国の謎解き冒険",
    author: "歴史ミステリー作家",
    description: "戦国時代を舞台にしたミステリー。実際の歴史も学べる冒険物語",
    kanjiLevel: "中学年",
    readingLevel: 3,
    genres: ["mystery", "history"],
    keywords: ["戦国", "ミステリー", "歴史", "冒険", "学習"],
    isFiction: true,
    isNonfiction: true,  // フィクション兼ノンフィクション（歴史学習要素）
    targetAge: { min: 9, max: 10 },
    difficulty: "標準",
    createdAt: new Date()
  },

  // フィクション - 高学年
  {
    title: "【小学館】未来少年コナンの大冒険",
    author: "宮崎駿原作",
    description: "文明崩壊後の世界で少年コナンが仲間と共に冒険する物語",
    kanjiLevel: "高学年",
    readingLevel: 2,
    genres: ["fantasy"],
    keywords: ["冒険", "未来", "友情", "自然", "成長"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },
  {
    title: "【小学館】タッチ青春野球物語",
    author: "あだち充",
    description: "双子の兄弟と幼なじみの少女を中心とした青春野球ドラマ",
    kanjiLevel: "高学年",
    readingLevel: 1,
    genres: ["slice-of-life"],
    keywords: ["野球", "青春", "友情", "恋愛", "成長"],
    isFiction: true,
    isNonfiction: false,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },
  {
    title: "【小学館】SF科学冒険！宇宙の謎に挑む",
    author: "科学SF作家",
    description: "宇宙を舞台にしたSF冒険で最新の宇宙科学も学べる物語",
    kanjiLevel: "高学年",
    readingLevel: 3,
    genres: ["fantasy", "science"],
    keywords: ["宇宙", "SF", "科学", "冒険", "学習"],
    isFiction: true,
    isNonfiction: true,  // フィクション兼ノンフィクション（宇宙科学学習要素）
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },

  // ノンフィクション - 高学年
  {
    title: "【小学館】世界遺産大図鑑",
    author: "世界遺産研究会",
    description: "ユネスコ世界遺産に登録された世界各地の貴重な文化と自然",
    kanjiLevel: "高学年",
    readingLevel: 2,
    genres: ["history"],
    keywords: ["世界遺産", "文化", "歴史", "自然", "地理"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  },
  {
    title: "【小学館】宇宙開発の最前線",
    author: "宇宙科学研究所",
    description: "人類の宇宙探査の歴史と最新の宇宙開発技術",
    kanjiLevel: "高学年",
    readingLevel: 3,
    genres: ["science"],
    keywords: ["宇宙", "科学", "技術", "探査", "未来"],
    isFiction: false,
    isNonfiction: true,
    targetAge: { min: 11, max: 12 },
    difficulty: "難",
    createdAt: new Date()
  }
]

// データベースに投入する関数
export async function seedKanjiQuestions() {
  const client = await clientPromise
  const db = client.db('book-recommendation')
  
  await db.collection('kanji_questions').deleteMany({})
  const result = await db.collection('kanji_questions').insertMany(kanjiQuestions)
  console.log(`${result.insertedCount}個の漢字問題を投入しました`)
  
  return result
}

export async function seedReadingQuestions() {
  const client = await clientPromise
  const db = client.db('book-recommendation')
  
  await db.collection('reading_questions').deleteMany({})
  const result = await db.collection('reading_questions').insertMany(readingQuestions)
  console.log(`${result.insertedCount}個の読解問題を投入しました`)
  
  return result
}

export async function seedBooks() {
  const client = await clientPromise
  const db = client.db('book-recommendation')
  
  await db.collection('books').deleteMany({})
  const result = await db.collection('books').insertMany(sampleBooks)
  console.log(`${result.insertedCount}冊の書籍を投入しました`)
  
  return result
}

export async function seedShogakukanBooks() {
  const client = await clientPromise
  const db = client.db('book-recommendation')
  
  await db.collection('shogakukan_books').deleteMany({})
  const result = await db.collection('shogakukan_books').insertMany(shogakukanBooks)
  console.log(`${result.insertedCount}冊の小学館書籍を投入しました`)
  
  return result
}
