import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ChatRequest {
  userMessage: string
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  mode: 'conversation' | 'extract_keywords'
}

interface KeywordExtractionResult {
  keywords: string[]
  confidence: number
  reasoning: string
}

// 質問セット（ガイダンス用） - 小学生向けに簡潔で理解しやすい質問
const INTEREST_QUESTIONS = [
  "好きな本があったら教えてね！どんな話が好き？",
  "普段どんなことをして遊ぶのが好き？スポーツとか、ゲームとか、なんでもいいよ！",
  "動物、宇宙、恐竜、お料理など、どんなことに興味がある？", 
  "最近楽しかったことがあったら教えて！",
  "大きくなったら何になりたい？やってみたいことはある？"
]

// OpenAI APIを使った会話生成
async function generateResponseWithOpenAI(userMessage: string, conversationHistory: Array<{role: string, content: string}>): Promise<string> {
  try {
    const questionCount = conversationHistory.filter(msg => msg.role === 'assistant').length
    
    const systemPrompt = `あなたは小学生と仲良しのAI先生です。子どもと楽しくお話して、その子にぴったりの本を見つけるお手伝いをします。

子どもの興味や好きなことを聞いてください：
1. 好きな本や物語
2. 遊びや趣味（スポーツ、ゲーム、お絵かきなど）
3. 興味があること（動物、宇宙、恐竜、料理など）
4. 楽しかった出来事や将来の夢

今は${questionCount + 1}回目の質問です。

重要なルール：
- 1〜4回目：子どもの答えを褒めてから次の質問をする
- 5回目：子どもの答えを褒めてから「たくさん教えてくれてありがとう！きみにぴったりの本を探してくるね〜！✨」で終了する
- 絶対に5回を超えて質問しない

話し方のルール：
- ひらがなを多く使い、漢字は小学生レベルに
- 「〜だよ」「〜だね」など親しみやすく
- 短めの文で話す
- 子どもの答えを褒めて、興味を示す
- 質問は1つずつ、わかりやすく`

    const systemMessage = { role: 'system' as const, content: systemPrompt }
    const historyMessages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))
    const currentUserMessage = { role: 'user' as const, content: userMessage }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [systemMessage, ...historyMessages, currentUserMessage],
      max_tokens: 150,
      temperature: 0.7
    })

    return completion.choices[0].message?.content || "すみません、もう一度お聞かせください。"
    
  } catch (error) {
    console.error('OpenAI API error:', error)
    // フォールバック用のシンプルな応答
    const questionCount = conversationHistory.filter(msg => msg.role === 'assistant').length
    
    // 質問回数に応じて応答を決定
    if (questionCount === 5) {
      // 5回目（最終回）は終了メッセージ
      return "たくさん教えてくれてありがとう！きみにぴったりの本を探してくるね〜！✨"
    } else if (questionCount < 5) {
      // 1〜4回目は褒めて次の質問
      const responses = [
        "いいね！とっても面白そう！",
        "すごいね！それ大好きだよ！",
        "なるほど〜！よくわかったよ！",
        "ありがとう！とっても楽しそうだね！"
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      // 質問の順序: 初期メッセージ(INTEREST_QUESTIONS[0]相当)→[1]→[2]→[3]→[4]→終了
      // questionCount は assistant メッセージの数なので、2回目の質問なら INTEREST_QUESTIONS[1] を使う
      const questionIndex = questionCount
      if (questionIndex >= 1 && questionIndex < INTEREST_QUESTIONS.length) {
        return `${randomResponse} ${INTEREST_QUESTIONS[questionIndex]}`
      } else {
        return `${randomResponse} 他に好きなことがあったら教えてね！`
      }
    } else {
      // 6回目以降は終了メッセージ（念のため）
      return "たくさん教えてくれてありがとう！きみにぴったりの本を探してくるね〜！✨"
    }
  }
}

// 書籍データベースの全キーワードリスト（重複削除済み）
const BOOK_KEYWORDS = [
  '指でたどる', '選択', '迷路', 'しりとり', 'ピタゴラスイッチ', 'ユーフラテス', 'いぐら', '参加型絵本', '創造性', 'ゲーム感覚',
  '友情', '思いやり', '貸し借り', '独占欲', '成長', 'なかやみわ', '豆', 'ベッド', '分かち合い', '社会性',
  'ゾンビ', 'ホラーコメディ', '探し絵', 'ゲームブック', 'コロコロコミック', 'ギャグ', 'モンスター', '読書が苦手', 'インタラクティブ', 'ながとしやすなり',
  '図鑑', 'しかけ絵本', 'めくる', '好奇心', '幼児向け', 'NEO', '発見', '英語つき', '学習',
  '百科事典', '科学', '疑問', '学習指導要領', '理科', 'ビジュアル', '図解', '物理法則', '生命科学', '宇宙',
  '瞬間', '写真', '物理', 'ハイスピードカメラ', '驚き', '視覚的学習', '課題図書', '伊地知国夫',
  '共感', '叱る', '親子関係', '教師', '七夕', '心情', '理解', '誤解', '子どもの視点', 'くすのきしげのり',
  '猫', 'ペット', '命', '死', '家族', '絆', 'ペットロス', '別れ', '感動',
  '言葉遊び', '語彙力', 'ひらがな', '思考力', '国語', '親子', '参加型', '広瀬友紀',
  'ミッケ', '観察力', '集中力', 'ジオラマ', '親子で楽しむ', 'ウォルター・ウィック', '糸井重里', 'ゲーム',
  'ポケモン', '謎解き', 'なぞなぞ', '松丸亮吾', 'ひらめき', 'アニメ', 'パズル', 'キャラクター',
  'ドラえもん', '推理', 'クイズ', '論理的思考', '学習まんが', '知識活用力', '探偵', '脳トレ',
  'バンパイア', '半バンパイア', '運命', 'ダークファンタジー', '奇怪なサーカス', '生存', '道徳的ジレンマ', '戦い',
  'パラレルワールド', '異世界転移', 'ヴェネツィア', '歴史ファンタジー', '陰謀', '魔法', '仮面', '病気との闘い', '時空旅行',
  '冒険ミステリー', '海辺の町', '伝説の魔物', '忘れ物係', '出生の秘密', '霧', 'ファンタジー', 'バディもの',
  '専門家監修', 'DVD付き', '自由研究', '最新情報', '本格的',
  '断面図', '仕組み', '構造', '技術', 'ものづくり', '写真絵本', '内部',
  '環境問題', '海洋汚染', 'プラスチックごみ', 'SDGs', '生態系', '社会貢献', '絵本', 'リサイクル', '行動', '地球',
  '日本史', '通史', '受験', '歴史の流れ', '時代考証', '山川出版社', '史実', '近現代史', '物語',
  '世界史', '名探偵コナン', '歴史ミステリー', 'タイムトラベル', 'エンターテインメント',
  '世界遺産', '地理', '国際理解', '文化遺産', '自然遺産', '平和', '地球の宝物', '旅行',
  '小学校', '日常', '人間関係', 'リアル', '多様性', '卒業', 'クラス', '感情の機微',
  '挑戦', '努力', '諦めない心', '腕相撲', '自信', '先生', '継続は力なり', '弱虫',
  'いじめ', '嫉妬', '中学校', '視点', '葛藤', '社会問題', '感情',
  'サバイバル', '脱出ゲーム', '論理パズル',
  '5つの力', 'ゲーミフィケーション', 'デジタル教材', 'プログラミング的思考',
  '少女探偵', 'ペンギン', 'ファンタジーミステリー', '鏡の国', '怪盗', '論理', 'シリーズ',
  'ダーウィン', 'ガラパゴス諸島', '進化論', 'ドラゴン', '歴史', '知的好奇心',
  '日食', '天文学', '神話', '太陽', '月', '文化', '自然現象', '探究心',
  '馬', '日本縦断', '旅', '実話', '動物の視点', '版画', '自然', '人間社会',
  '科学史', '発明', '実験', '物理学', '科学者', '原理',
  '人体', '解剖学', '生物学', '健康', '思春期', '病気', '医学', '生命',
  '文化史', '政治史', '社会', '教育',
  '伝記', '平塚らいてう', '女性の権利', '社会運動', '歴史人物', 'ジェンダー', 'ロールモデル', '青鞜',
  '人物事典', '参考書', '探究学習', '相関関係', '歴史研究', '資料',
  '喧嘩', '仲直り', '小学生', '夏休み', 'コミュニケーション', '関西弁',
  'ミステリー', '執事', 'ユーモア', '安楽椅子探偵', '伏線', 'トリック',
  'ノベライズ', 'アクション', '読書入門', '映画', 'サスペンス',
  '特殊能力', '引きこもり', 'ネット社会', '都市伝説', 'ジュニア文庫',
  '探検', '想像力', '縦開き絵本', '数の学習', '生き物', '招待状', '建物', '出会い',
  'キャンディー', '変身', 'いたずら', '動物', 'ピンチ', '解決', 'タヌキ',
  '恐竜', 'バトル', '骨', '勇気', '敵',
  'カーレース', 'ゾロリ', '仲間', '困難の克服', 'キツネ',
  'クレヨン', '手紙', '個性', '固定観念', '対話', '自己表現', '不満',
  '擬人化', '思い出', '持ち物', '喪失感', '感謝', '忘れられたもの', '役割',
  '乗り物', '交通', '技術史', '文明', '物流', '道具', '人間の工夫',
  '水の循環', '科学絵本', '蒸発', '雨', '雪', '川', '海',
  '進化', '生物', '動物', '豆知識', '生態', '弱点',
  '絶滅', '生き物', '環境問題', '理由', '生存戦略',
  '昆虫', '対決', 'トーナメント', '最強', 'シミュレーション', '知識',
  'アリ', '共生', '擬態', '自然観察', '生き残り戦略',
  'ルール', '遊び', 'ボタン', '約束',
  '商店街', 'お店', '買い物',
  'おばけ', '学校の怪談', '怖い話', '対処法', '勇気', '妖怪',
  '江戸時代', '岡っ引き', '捕物帳', '九尾の狐',
  'UMA', '未確認動物', '謎', '伝説', 'オカルト', '探求', '目撃情報', '超常現象',
  '料理', '協力', 'かすてら', '森の動物', 'ロングセラー', 'ねずみ', '食育',
  '着替え', '自立心', '発想の転換', '幼児あるある', '哲学',
  '秘密基地', 'DIY', '森', 'パーティー',
  '気持ち', '道徳', '良心', '銀行', 'コイン', '自己反省',
  '本', '書店', '読書', 'アイデア', '専門店', '本好き', '夢', 'グッズ',
  '母と娘', '寂しさ', '働く母親', '和菓子屋', '民話', '愛情',
  '認知症', '祖母と孫', '老い', '介護', '記憶',
  '犬', '飼い主', '信頼', '孤独', 'コミュニティ',
  '数学', '好き', '視点の転換', '科学の目', 'パターン', '形', '才能',
  '駄菓子', '幸運', '教訓', '短編集', '悩み解決', '不思議', '女主人',
  '勇気', '知恵', '問題解決', '竜', 'クラシック',
  'マインクラフト', 'ものづくり', '異世界', '記憶喪失', 'クラフト',
  'カモノハシ', 'オーストラリア', 'ドイツ', '計画',
  '常識', '逆転の発想', '価値観', '労働', '兄妹',
  '留守番', '自由', '不思議な出来事', '動物との対話', '連作',
  '転校生', '孤独', 'カッパ', '行動力', '自己肯定',
  '雑学', '残念',
  '古代生物',
  '深海', '海洋生物', '潜水艦', '危機的状況', 'チームワーク',
  '空想', 'マンガ', '検証', 'ヒーロー', '読本',
  '食文化', '保存食', '世界の料理', '乾燥', '食べ物', '発酵',
  '北極', '南極', '地球温暖化', '比較', '探検', '記者', 'ノンフィクション',
  'カラス', '動物行動学', '都市と自然', '共存', '観察日記', '知能',
  '事件', '読者への挑戦', '証拠', '犯人当て',
  'どんでん返し', 'ショートショート', '意外な結末', 'ホラー', '朝読',
  '暗号', '探偵団', '学校', '秘密',
  '怪盗', '中学生', '正義', '2代目', '相棒',
  'FBI', '映画ノベライズ', '赤井秀一',
  'フードバンク', '貧困', '助け合い', '正義感', 'イギリス',
  'りんご', '疑問',
  '店主', '空想',
  '天国', '生と死', 'おじいちゃん', 'ノート',
  '退屈', '内省',
  '異世代交流', '伝統工芸', '竹細工', '自己犠牲', '心の成長', '職人', '癒やし',
  '責任', '不登校', '獣医師',
  '味噌', '家業', '帰国子女', '価値の再発見', '日本文化', '異文化交流',
  '戦国時代', '武将', '天下統一', '英雄', '織田信長',
  '偉人', '障害', '希望', 'サリバン先生',
  '古典', '神様', '怪物', '国生み', '伝統',
  'オオカミ', '動物記', '知恵比べ', '自然との共存', '誇り', '夫婦愛', 'アメリカ西部', '野生動物',
  'ケイト・セッションズ', '植物学', '環境保護', 'サンディエゴ', '女性科学者', '情熱', '緑化', 'パイオニア',
  '古紙', '仕事', '岡山',
  'インド', '改革', 'リーダーシップ', '植樹',
  '居場所', 'サードプレイス', '救済', '辻村深月',
  '無人島', '探検',
  '鬼', '伝承', '昔話', '異界', '神隠し',
  '願い', '不幸', '紅子', '欲望', 'オムニバス',
  '工夫', '生存', '挑戦',
  '時間', '契約', '寿命', '廣嶋玲子',
  '善と悪', 'J.K.ローリング', '孤児',
  'クニマス', '絶滅種', '再発見', '田沢湖', '西湖', '魚'
]

// OpenAI APIを使ったキーワード抽出（キーワードリストから選択）
async function extractKeywordsWithOpenAI(conversationHistory: Array<{role: string, content: string}>): Promise<KeywordExtractionResult> {
  try {
    const userMessages = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n')

    const systemPrompt = `以下の会話から、子どもの興味や関心を表すキーワードを抽出してください。

利用可能なキーワードリスト：
${BOOK_KEYWORDS.join(', ')}

この中から、会話内容に最も関連する30個のキーワードを選択してください。
選択する際は以下の基準で判断してください：
1. 直接言及されているトピック
2. 間接的に関連する内容
3. 子どもが興味を示しそうな関連分野

以下のJSONフォーマットで回答してください：
{
  "keywords": ["キーワード1", "キーワード2", ...],
  "reasoning": "選択理由の説明"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `会話内容:\n${userMessages}` }
      ],
      max_tokens: 300,
      temperature: 0.3
    })

    const responseText = completion.choices[0].message?.content || ''
    
    try {
      // レスポンステキストを清理（コードブロックマーカーなどを削除）
      const cleanedText = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()
      
      // JSONかどうかチェック（{}で始まり}で終わる）
      if (!cleanedText.startsWith('{') || !cleanedText.endsWith('}')) {
        console.log('Response is not valid JSON format:', cleanedText)
        return await extractKeywordsFallback(conversationHistory)
      }
      
      const parsed = JSON.parse(cleanedText)
      
      // 選択されたキーワードが実際にリストに含まれているかチェック
      const validKeywords = Array.isArray(parsed.keywords) 
        ? parsed.keywords.filter((keyword: string) => BOOK_KEYWORDS.includes(keyword)).slice(0, 10)
        : []
      
      if (validKeywords.length === 0) {
        console.log('No valid keywords found, using fallback')
        return await extractKeywordsFallback(conversationHistory)
      }
      
      return {
        keywords: validKeywords,
        confidence: Math.min(validKeywords.length * 0.1 + 0.1, 0.9),
        reasoning: parsed.reasoning || `リストから${validKeywords.length}個のキーワードを選択しました`
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Original response text:', responseText)
      return await extractKeywordsFallback(conversationHistory)
    }
    
  } catch (error) {
    console.error('OpenAI keyword extraction error:', error)
    return await extractKeywordsFallback(conversationHistory)
  }
}

// フォールバック用のキーワード抽出（キーワードリストから選択）
async function extractKeywordsFallback(conversationHistory: Array<{role: string, content: string}>): Promise<KeywordExtractionResult> {
  const userMessages = conversationHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join(' ')
  
  const extractedKeywords: string[] = []
  
  // 書籍キーワードリストから会話に関連するものを検索
  const userMessageLower = userMessages.toLowerCase()
  
  // 直接マッチングするキーワードを検索
  for (const keyword of BOOK_KEYWORDS) {
    if (userMessageLower.includes(keyword.toLowerCase())) {
      extractedKeywords.push(keyword)
    }
  }
  
  // 関連語によるマッチング（より幅広く検索）
  const relatedPatterns = [
    { keywords: ['友情', '仲間'], patterns: ['友達', '友人', '仲良し', '一緒'] },
    { keywords: ['動物', 'ペット', '猫', '犬'], patterns: ['どうぶつ', 'ペット', 'ねこ', 'いぬ', '犬', '猫'] },
    { keywords: ['宇宙', '科学', '天文学'], patterns: ['ほし', '星', '宇宙', '惑星', '太陽', '月'] },
    { keywords: ['冒険', '探検'], patterns: ['冒険', '探検', 'アドベンチャー', '旅'] },
    { keywords: ['魔法', 'ファンタジー'], patterns: ['まほう', '魔法', 'ファンタジー', '魔術'] },
    { keywords: ['学校', '小学校'], patterns: ['がっこう', '学校', '勉強', '授業'] },
    { keywords: ['家族', '親子'], patterns: ['家族', 'お母さん', 'お父さん', '兄弟', '姉妹'] },
    { keywords: ['料理', '食育'], patterns: ['料理', '食べ物', 'クッキング', 'お菓子'] },
    { keywords: ['音楽'], patterns: ['音楽', '歌', '楽器', 'ピアノ'] },
    { keywords: ['恐竜'], patterns: ['恐竜', '化石', 'きょうりゅう'] },
    { keywords: ['読書', '本'], patterns: ['本', '読書', '小説', '物語'] },
    { keywords: ['ゲーム', 'マインクラフト'], patterns: ['ゲーム', 'マイクラ', 'マインクラフト'] }
  ]
  
  for (const { keywords, patterns } of relatedPatterns) {
    if (patterns.some(pattern => userMessageLower.includes(pattern))) {
      for (const keyword of keywords) {
        if (BOOK_KEYWORDS.includes(keyword) && !extractedKeywords.includes(keyword)) {
          extractedKeywords.push(keyword)
        }
      }
    }
  }
  
  // デフォルトキーワード（何も見つからない場合）
  if (extractedKeywords.length === 0) {
    const defaultKeywords = ['友情', '冒険', '学校', '家族', '成長']
    extractedKeywords.push(...defaultKeywords.filter(k => BOOK_KEYWORDS.includes(k)))
  }
  
  return {
    keywords: extractedKeywords.slice(0, 10),
    confidence: Math.min(extractedKeywords.length * 0.1, 0.8),
    reasoning: `パターンマッチングで「${extractedKeywords.slice(0, 5).join('、')}」などのキーワードを抽出しました`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory = [], mode = 'conversation' }: ChatRequest = await request.json()
    
    // キーワード抽出モードでは userMessage は空でも OK
    if (mode !== 'extract_keywords' && !userMessage) {
      return NextResponse.json({
        success: false,
        message: 'ユーザーメッセージが必要です'
      }, { status: 400 })
    }
    
    if (mode === 'extract_keywords') {
      // キーワード抽出モード
      const extractionResult = await extractKeywordsWithOpenAI(conversationHistory)
      
      return NextResponse.json({
        success: true,
        keywords: extractionResult.keywords,
        confidence: extractionResult.confidence,
        reasoning: extractionResult.reasoning,
        isComplete: true
      })
    } else {
      // 会話モード
      const response = await generateResponseWithOpenAI(userMessage, conversationHistory)
      
      // 更新された会話履歴
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      ]
      
      // 会話が完了したかどうかを判定（5回の質問で完了）
      const assistantMessageCount = updatedHistory.filter(msg => msg.role === 'assistant').length
      const isComplete = assistantMessageCount >= 5
      
      return NextResponse.json({
        success: true,
        response,
        conversationHistory: updatedHistory,
        isComplete,
        nextQuestion: null // OpenAI が動的に生成するため null
      })
    }
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      success: false,
      message: 'チャット機能でエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET: 会話を開始する
export async function GET() {
  try {
    const initialMessage = "こんにちは！きみにぴったりの本を見つけるお手伝いをするよ！😊 いくつか質問させてもらうね。好きな本があったら教えて！どんなお話が好きかな？"
    
    return NextResponse.json({
      success: true,
      message: 'チャット開始',
      response: initialMessage,
      conversationHistory: [
        { role: 'assistant', content: initialMessage }
      ],
      isComplete: false,
      nextQuestion: null
    })
    
  } catch (error) {
    console.error('Chat init error:', error)
    return NextResponse.json({
      success: false,
      message: 'チャット初期化でエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 