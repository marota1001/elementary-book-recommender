import { NextRequest, NextResponse } from 'next/server'

interface ReadingPassage {
  kanjiLevel: string  // '低学年', '中学年', '高学年'
  readingLevel: number // 1, 2, 3
  title: string
  passage: string
  description: string
}

// 漢字レベル × 読解レベルの文章マトリックス
const READING_PASSAGES: Record<string, Record<number, ReadingPassage>> = {
  '低学年': {
    1: {
      kanjiLevel: '低学年',
      readingLevel: 1,
      title: 'たのしい えんそく',
      passage: 'あさ、たろうくんは がっこうに いきました。きょうは たのしい えんそくの ひです。みんなで こうえんに いって、おべんとうを たべました。たろうくんは とても うれしかったです。',
      description: 'ひらがなが中心の短い文章'
    },
    2: {
      kanjiLevel: '低学年',
      readingLevel: 2,
      title: 'がっこうの友だち',
      passage: '今日は学校で新しい友だちができました。名前は花子さんです。花子さんは絵をかくのがとても上手です。休み時間にいっしょに絵をかいて遊びました。明日もいっしょに遊ぶ約束をしました。',
      description: '基本的な漢字を含む文章'
    },
    3: {
      kanjiLevel: '低学年',
      readingLevel: 3,
      title: '動物園で見たこと',
      passage: '動物園に行って、たくさんの動物を見てきました。大きなぞうは鼻で水をかけていました。かわいいペンギンは上手に泳いでいました。一番びっくりしたのは、きりんの首がとても長いことです。動物たちはみんな元気で、見ているだけで楽しくなりました。',
      description: 'やや長い文章で複数の出来事を描写'
    }
  },
  '中学年': {
    1: {
      kanjiLevel: '中学年',
      readingLevel: 1,
      title: '図書館での発見',
      passage: '昨日、図書館で面白い本を見つけました。恐竜について書かれた本で、昔の地球にはたくさんの種類の恐竜が住んでいたことを知りました。特にティラノサウルスは体長が12メートルもあり、とても大きな肉食恐竜だったそうです。',
      description: '基本的な説明文'
    },
    2: {
      kanjiLevel: '中学年',
      readingLevel: 2,
      title: '地域のお祭り',
      passage: '毎年夏になると、私たちの町では大きなお祭りが開かれます。商店街の人たちが協力して、屋台を出したり、盆踊りの準備をしたりします。子どもたちは浴衣を着て参加し、大人たちも一緒になって楽しみます。このお祭りは地域の人々をつなぐ大切な行事になっています。',
      description: '社会的なつながりを説明する文章'
    },
    3: {
      kanjiLevel: '中学年',
      readingLevel: 3,
      title: 'リサイクルの大切さ',
      passage: '私たちの暮らしの中で出るごみを減らすために、リサイクルという方法があります。ペットボトルは新しいペットボトルや服に、新聞紙は再び新聞紙やダンボールに生まれ変わります。しかし、リサイクルにもエネルギーが必要です。まずは無駄なものを買わない、長く使うという心がけが一番大切なのです。',
      description: '原因と結果、対策を論理的に説明'
    }
  },
  '高学年': {
    1: {
      kanjiLevel: '高学年',
      readingLevel: 1,
      title: '科学技術と生活',
      passage: '科学技術の発達により、私たちの生活は便利になりました。スマートフォンやコンピューターなどの機器により、世界中の人々と簡単につながることができます。医療技術の進歩により、昔は治せなかった病気も治療できるようになりました。',
      description: '具体例を示した論理的な文章'
    },
    2: {
      kanjiLevel: '高学年',
      readingLevel: 2,
      title: '文化の多様性',
      passage: '世界には様々な文化があり、それぞれに独特の価値観や習慣があります。日本では靴を脱いで家に上がりますが、欧米では靴のまま室内で過ごすことが一般的です。このような違いは、長い歴史の中で気候や地理的条件によって形成されたものです。異なる文化を理解し、尊重することは国際社会で生きていく上で重要な能力と言えるでしょう。',
      description: '抽象的概念と具体例を組み合わせた文章'
    },
    3: {
      kanjiLevel: '高学年',
      readingLevel: 3,
      title: '持続可能な社会',
      passage: '持続可能な社会を実現するためには、経済発展と環境保護のバランスを取ることが必要です。再生可能エネルギーの導入や循環型社会の構築など、様々な取り組みが求められています。しかし、これらの課題解決には技術革新だけでなく、私たち一人ひとりの意識変革も欠かせません。未来の世代により良い地球を残すために、今何ができるかを考え続けることが重要です。',
      description: '複雑な社会問題を多角的に論じた文章'
    }
  }
}

// GETリクエスト - 指定された漢字レベルと読解レベルの文章を返す
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kanjiLevel = searchParams.get('kanjiLevel') || '中学年'  // デフォルト
    const readingLevelParam = searchParams.get('readingLevel')
    const readingLevel = readingLevelParam ? parseInt(readingLevelParam) : 2  // 真ん中のレベルから開始
    
    // パラメータの検証
    if (!['低学年', '中学年', '高学年'].includes(kanjiLevel)) {
      return NextResponse.json({
        success: false,
        message: '漢字レベルは「低学年」「中学年」「高学年」のいずれかを指定してください'
      }, { status: 400 })
    }
    
    if (readingLevel < 1 || readingLevel > 3) {
      return NextResponse.json({
        success: false,
        message: '読解レベルは1から3の間で指定してください'
      }, { status: 400 })
    }
    
    const passage = READING_PASSAGES[kanjiLevel]?.[readingLevel]
    
    if (!passage) {
      return NextResponse.json({
        success: false,
        message: '指定されたレベルの文章が見つかりません'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      kanjiLevel,
      readingLevel,
      passage
    })
    
  } catch (error) {
    console.error('Reading test fetch error:', error)
    return NextResponse.json({
      success: false,
      message: '読解テストの文章取得に失敗しました'
    }, { status: 500 })
  }
}

// POSTリクエスト - 感想を受け取って次の読みものレベルを決定（適応的調整）
export async function POST(request: NextRequest) {
  try {
    const { kanjiLevel, readingLevel, feedback } = await request.json()
    
    // バリデーション
    if (!kanjiLevel || !['低学年', '中学年', '高学年'].includes(kanjiLevel)) {
      return NextResponse.json({
        success: false,
        message: '有効な漢字レベルを指定してください'
      }, { status: 400 })
    }
    
    if (!readingLevel || readingLevel < 1 || readingLevel > 3) {
      return NextResponse.json({
        success: false,
        message: '有効な読みものレベルを指定してください'
      }, { status: 400 })
    }
    
    if (!feedback) {
      return NextResponse.json({
        success: false,
        message: '感想が必要です'
      }, { status: 400 })
    }
    
    let nextReadingLevel = readingLevel
    let shouldContinue = true
    let message = ''
    let adjustmentExplanation = ''
    
    // 感想に基づいて次の読みものレベルを決定（同じ漢字レベル内で適応的に調整）
    // 読みものチェックは真ん中のレベル（2）から開始し、ユーザーの感想に応じて上下に調整
    switch (feedback) {
      case 'very-easy': // とてもかんたん
        nextReadingLevel = Math.min(readingLevel + 2, 3)
        adjustmentExplanation = nextReadingLevel === readingLevel ? '最高レベルです' : 'もう少し難しい文章に挑戦してみましょう'
        break
      case 'somewhat-easy': // すこしかんたん  
        nextReadingLevel = Math.min(readingLevel + 1, 3)
        adjustmentExplanation = nextReadingLevel === readingLevel ? '最高レベルです' : '少し難しい文章に挑戦してみましょう'
        break
              case 'appropriate': // ちょうどよい
          shouldContinue = false
          message = 'お疲れ様でした！あなたにぴったりの読みものレベルが決まりました。'
          adjustmentExplanation = `このレベルがちょうどよいですね`
          break
        case 'somewhat-difficult': // すこしむずかしい
          if (readingLevel > 1) {
            nextReadingLevel = readingLevel - 1
            adjustmentExplanation = '少し読みやすい文章に調整します'
          } else {
            shouldContinue = false
            message = 'お疲れ様でした！あなたにぴったりの読みものレベルが決まりました。'
            adjustmentExplanation = `このレベルがちょうどよいですね`
          }
          break
        case 'very-difficult': // とてもむずかしい
          if (readingLevel > 2) {
            nextReadingLevel = readingLevel - 2
            adjustmentExplanation = 'もう少し読みやすい文章に調整します'
          } else if (readingLevel > 1) {
            nextReadingLevel = readingLevel - 1
            adjustmentExplanation = '読みやすい文章に調整します'
          } else {
            shouldContinue = false
            message = 'お疲れ様でした！あなたにぴったりの読みものレベルが決まりました。'
            adjustmentExplanation = `このレベルがちょうどよいですね`
          }
          break
      default:
        return NextResponse.json({
          success: false,
          message: '有効な感想を選択してください'
        }, { status: 400 })
    }
    
          // 同じレベルになった場合は終了（最上位または最下位に達した場合）
      if (nextReadingLevel === readingLevel && shouldContinue) {
        shouldContinue = false
        message = 'お疲れ様でした！あなたにぴったりの読みものレベルが決まりました。'
      }
    
    // 最終的に決定された読解レベル
    const finalReadingLevel = shouldContinue ? null : (feedback === 'appropriate' ? readingLevel : nextReadingLevel)
    
    return NextResponse.json({
      success: true,
      kanjiLevel,
      currentReadingLevel: readingLevel,
      nextReadingLevel,
      shouldContinue,
      message,
      adjustmentExplanation,
      determinedReadingLevel: finalReadingLevel,
      testProgress: {
        isComplete: !shouldContinue,
        currentStep: shouldContinue ? 'continue' : 'complete',
        nextStep: shouldContinue ? 'show-next-passage' : 'proceed-to-recommendation'
      }
    })
    
  } catch (error) {
    console.error('Reading test feedback error:', error)
    return NextResponse.json({
      success: false,
      message: '感想の処理に失敗しました'
    }, { status: 500 })
  }
}
