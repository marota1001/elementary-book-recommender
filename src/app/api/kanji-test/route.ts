import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { KanjiQuestion } from '../../../models/TestQuestion'

// MongoDB接続ヘルパー
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return
  }
  await mongoose.connect(process.env.MONGODB_URI as string)
}

interface KanjiQuestionData {
  grade: number
  question: string
  options: string[]
  correctAnswer: string
  kanji: string
  meaning: string
}

// サンプルの漢字テスト問題
const SAMPLE_QUESTIONS: Record<number, KanjiQuestionData[]> = {
  1: [
    {
      grade: 1,
      question: 'この漢字の読み方はどれですか？「山」',
      options: ['やま', 'かわ', 'き', 'いし'],
      correctAnswer: 'やま',
      kanji: '山',
      meaning: 'やま、山'
    },
    {
      grade: 1,
      question: 'この漢字の読み方はどれですか？「人」',
      options: ['ひと', 'いり', 'おお', 'てん'],
      correctAnswer: 'ひと',
      kanji: '人',
      meaning: 'ひと、人'
    },
    {
      grade: 1,
      question: 'この漢字の読み方はどれですか？「月」',
      options: ['つき', 'ひ', 'ほし', 'そら'],
      correctAnswer: 'つき',
      kanji: '月',
      meaning: 'つき、月'
    },
    {
      grade: 1,
      question: 'この漢字の読み方はどれですか？「水」',
      options: ['みず', 'ひ', 'き', 'つち'],
      correctAnswer: 'みず',
      kanji: '水',
      meaning: 'みず、水'
    },
    {
      grade: 1,
      question: 'この漢字の読み方はどれですか？「火」',
      options: ['ひ', 'みず', 'き', 'つち'],
      correctAnswer: 'ひ',
      kanji: '火',
      meaning: 'ひ、火'
    }
  ],
  2: [
    {
      grade: 2,
      question: 'この漢字の読み方はどれですか？「花」',
      options: ['はな', 'くさ', 'き', 'は'],
      correctAnswer: 'はな',
      kanji: '花',
      meaning: 'はな、花'
    },
    {
      grade: 2,
      question: 'この漢字の読み方はどれですか？「空」',
      options: ['そら', 'あめ', 'くも', 'かぜ'],
      correctAnswer: 'そら',
      kanji: '空',
      meaning: 'そら、空'
    },
    {
      grade: 2,
      question: 'この漢字の読み方はどれですか？「雨」',
      options: ['あめ', 'ゆき', 'かぜ', 'くも'],
      correctAnswer: 'あめ',
      kanji: '雨',
      meaning: 'あめ、雨'
    },
    {
      grade: 2,
      question: 'この漢字の読み方はどれですか？「手」',
      options: ['て', 'あし', 'め', 'みみ'],
      correctAnswer: 'て',
      kanji: '手',
      meaning: 'て、手'
    },
    {
      grade: 2,
      question: 'この漢字の読み方はどれですか？「目」',
      options: ['め', 'て', 'みみ', 'はな'],
      correctAnswer: 'め',
      kanji: '目',
      meaning: 'め、目'
    }
  ],
  3: [
    {
      grade: 3,
      question: 'この漢字の読み方はどれですか？「音楽」',
      options: ['おんがく', 'うたごえ', 'おどり', 'えんそう'],
      correctAnswer: 'おんがく',
      kanji: '音楽',
      meaning: 'おんがく、音楽'
    },
    {
      grade: 3,
      question: 'この漢字の読み方はどれですか？「時間」',
      options: ['じかん', 'ふんびょう', 'とけい', 'にちじ'],
      correctAnswer: 'じかん',
      kanji: '時間',
      meaning: 'じかん、時間'
    },
    {
      grade: 3,
      question: 'この漢字の読み方はどれですか？「教室」',
      options: ['きょうしつ', 'がっこう', 'べんきょう', 'せんせい'],
      correctAnswer: 'きょうしつ',
      kanji: '教室',
      meaning: 'きょうしつ、教室'
    },
    {
      grade: 3,
      question: 'この漢字の読み方はどれですか？「勉強」',
      options: ['べんきょう', 'きょうしつ', 'がっこう', 'せんせい'],
      correctAnswer: 'べんきょう',
      kanji: '勉強',
      meaning: 'べんきょう、勉強'
    },
    {
      grade: 3,
      question: 'この漢字の読み方はどれですか？「友達」',
      options: ['ともだち', 'かぞく', 'せんせい', 'きょうだい'],
      correctAnswer: 'ともだち',
      kanji: '友達',
      meaning: 'ともだち、友達'
    }
  ],
  4: [
    {
      grade: 4,
      question: 'この漢字の読み方はどれですか？「新聞」',
      options: ['しんぶん', 'ざっし', 'てがみ', 'しょるい'],
      correctAnswer: 'しんぶん',
      kanji: '新聞',
      meaning: 'しんぶん、新聞'
    },
    {
      grade: 4,
      question: 'この漢字の読み方はどれですか？「電車」',
      options: ['でんしゃ', 'じどうしゃ', 'ひこうき', 'ふね'],
      correctAnswer: 'でんしゃ',
      kanji: '電車',
      meaning: 'でんしゃ、電車'
    },
    {
      grade: 4,
      question: 'この漢字の読み方はどれですか？「図書館」',
      options: ['としょかん', 'びじゅつかん', 'はくぶつかん', 'えいがかん'],
      correctAnswer: 'としょかん',
      kanji: '図書館',
      meaning: 'としょかん、図書館'
    },
    {
      grade: 4,
      question: 'この漢字の読み方はどれですか？「辞書」',
      options: ['じしょ', 'ほん', 'しんぶん', 'ざっし'],
      correctAnswer: 'じしょ',
      kanji: '辞書',
      meaning: 'じしょ、辞書'
    },
    {
      grade: 4,
      question: 'この漢字の読み方はどれですか？「病院」',
      options: ['びょういん', 'がっこう', 'こうえん', 'えき'],
      correctAnswer: 'びょういん',
      kanji: '病院',
      meaning: 'びょういん、病院'
    }
  ],
  5: [
    {
      grade: 5,
      question: 'この漢字の読み方はどれですか？「環境」',
      options: ['かんきょう', 'しゅうい', 'しぜん', 'じょうたい'],
      correctAnswer: 'かんきょう',
      kanji: '環境',
      meaning: 'かんきょう、環境'
    },
    {
      grade: 5,
      question: 'この漢字の読み方はどれですか？「生活」',
      options: ['せいかつ', 'じんせい', 'くらし', 'ひび'],
      correctAnswer: 'せいかつ',
      kanji: '生活',
      meaning: 'せいかつ、生活'
    },
    {
      grade: 5,
      question: 'この漢字の読み方はどれですか？「健康」',
      options: ['けんこう', 'げんき', 'たいりょく', 'じょうぶ'],
      correctAnswer: 'けんこう',
      kanji: '健康',
      meaning: 'けんこう、健康'
    },
    {
      grade: 5,
      question: 'この漢字の読み方はどれですか？「経験」',
      options: ['けいけん', 'たいけん', 'べんきょう', 'ちしき'],
      correctAnswer: 'けいけん',
      kanji: '経験',
      meaning: 'けいけん、経験'
    },
    {
      grade: 5,
      question: 'この漢字の読み方はどれですか？「技術」',
      options: ['ぎじゅつ', 'のうりょく', 'ちから', 'わざ'],
      correctAnswer: 'ぎじゅつ',
      kanji: '技術',
      meaning: 'ぎじゅつ、技術'
    }
  ],
  6: [
    {
      grade: 6,
      question: 'この漢字の読み方はどれですか？「正義」',
      options: ['せいぎ', 'こうへい', 'どうとく', 'りんり'],
      correctAnswer: 'せいぎ',
      kanji: '正義',
      meaning: 'せいぎ、正義'
    },
    {
      grade: 6,
      question: 'この漢字の読み方はどれですか？「協力」',
      options: ['きょうりょく', 'てつだい', 'えんじょ', 'しえん'],
      correctAnswer: 'きょうりょく',
      kanji: '協力',
      meaning: 'きょうりょく、協力'
    },
    {
      grade: 6,
      question: 'この漢字の読み方はどれですか？「将来」',
      options: ['しょうらい', 'みらい', 'ぜんと', 'てんぼう'],
      correctAnswer: 'しょうらい',
      kanji: '将来',
      meaning: 'しょうらい、将来'
    },
    {
      grade: 6,
      question: 'この漢字の読み方はどれですか？「責任」',
      options: ['せきにん', 'ぎむ', 'やくめ', 'しごと'],
      correctAnswer: 'せきにん',
      kanji: '責任',
      meaning: 'せきにん、責任'
    },
    {
      grade: 6,
      question: 'この漢字の読み方はどれですか？「議論」',
      options: ['ぎろん', 'はなし', 'かいぎ', 'そうだん'],
      correctAnswer: 'ぎろん',
      kanji: '議論',
      meaning: 'ぎろん、議論'
    }
  ]
}

// GETリクエスト - 指定された学年の問題を返す
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータから学年を取得
    const { searchParams } = new URL(request.url)
    const gradeParam = searchParams.get('grade')
    const grade = gradeParam ? parseInt(gradeParam) : 1
    
    // 学年の範囲チェック
    if (grade < 1 || grade > 6) {
      return NextResponse.json({
        success: false,
        message: '学年は1から6の間で指定してください'
      }, { status: 400 })
    }
    
    // データベースから問題を取得（または初期データを使用）
    let questions: KanjiQuestionData[] = []
    
    try {
      await connectDB()
      const dbQuestions = await KanjiQuestion.find({ grade }).lean() as unknown as KanjiQuestionData[]
      
      // データがない場合はサンプルデータを使用
      if (dbQuestions.length === 0) {
        questions = SAMPLE_QUESTIONS[grade] || []
      } else {
        questions = dbQuestions
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      questions = SAMPLE_QUESTIONS[grade] || []
    }
    
    return NextResponse.json({
      success: true,
      grade,
      questions,
      total: questions.length
    })
    
  } catch (error) {
    console.error('Kanji test fetch error:', error)
    return NextResponse.json({
      success: false,
      message: '漢字テストの問題取得に失敗しました'
    }, { status: 500 })
  }
}

// POSTリクエスト - 回答を採点する
export async function POST(request: NextRequest) {
  try {
    const { grade, answers } = await request.json()
    
    // バリデーション
    if (!grade || grade < 1 || grade > 6) {
      return NextResponse.json({
        success: false,
        message: '有効な学年を指定してください'
      }, { status: 400 })
    }
    
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({
        success: false,
        message: '回答データが必要です'
      }, { status: 400 })
    }
    
    // データベースから問題を取得（または初期データを使用）
    let questions: KanjiQuestionData[] = []
    
    try {
      await connectDB()
      const dbQuestions = await KanjiQuestion.find({ grade }).lean() as unknown as KanjiQuestionData[]
      
      // データがない場合はサンプルデータを使用
      if (dbQuestions.length === 0) {
        questions = SAMPLE_QUESTIONS[grade] || []
      } else {
        questions = dbQuestions
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      questions = SAMPLE_QUESTIONS[grade] || []
    }
    
    // 回答を採点
    const results = questions.map((question, index) => {
      const userAnswer = answers[index] || ''
      const isCorrect = userAnswer === question.correctAnswer
      
      return {
        question: question.question,
        kanji: question.kanji,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      }
    })
    
    // 正解数をカウント
    const correctCount = results.filter(r => r.isCorrect).length
    const accuracy = Math.round((correctCount / questions.length) * 100)
    
    return NextResponse.json({
      success: true,
      grade,
      results,
      score: {
        correct: correctCount,
        total: questions.length,
        accuracy
      }
    })
    
  } catch (error) {
    console.error('Kanji test scoring error:', error)
    return NextResponse.json({
      success: false,
      message: '漢字テストの採点に失敗しました'
    }, { status: 500 })
  }
}
