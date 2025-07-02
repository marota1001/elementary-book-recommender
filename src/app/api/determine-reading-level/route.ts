import { NextRequest, NextResponse } from 'next/server'

interface KanjiTestResult {
  grade: number           // 受験した学年（1-6）
  correctCount: number    // 正解数
  totalQuestions: number  // 総問題数
  accuracy: number        // 正答率（%）
}

interface DeterminedLevel {
  kanjiLevel: string      // '低学年', '中学年', '高学年'
  startingReadingLevel: number  // 2（真ん中から開始）
  explanation: string     // レベル決定の説明
  nextStep: 'reading-test'
}

// 漢字テスト結果から読解テスト用の漢字レベルを決定
function determineKanjiLevel(result: KanjiTestResult): string {
  const { grade, accuracy } = result
  
  // 正答率が80%以上の場合は、そのまま該当レベルか上位レベル
  // 正答率が60%未満の場合は、下位レベルに調整
  
  if (accuracy >= 80) {
    // 高い正答率：現在の学年レベルまたは上位レベル
    if (grade <= 2) return '低学年'
    if (grade <= 4) return '中学年'
    return '高学年'
  } else if (accuracy >= 60) {
    // 標準的な正答率：現在の学年レベル
    if (grade <= 2) return '低学年'
    if (grade <= 4) return '中学年'
    return '高学年'
  } else {
    // 低い正答率：下位レベルに調整
    if (grade <= 3) return '低学年'
    if (grade <= 5) return '中学年'
    return '高学年'
  }
}

// レベル決定の説明文生成
function generateExplanation(result: KanjiTestResult, determinedLevel: string): string {
  const { grade, accuracy } = result
  const gradeText = `${grade}年生`
  
  if (accuracy >= 80) {
    return `${gradeText}レベルの漢字チェックでとても良くできました！${determinedLevel}レベルの読みものから始めましょう。`
  } else if (accuracy >= 60) {
    return `${gradeText}レベルの漢字チェックができました。${determinedLevel}レベルの読みものから始めましょう。`
  } else {
    return `${gradeText}レベルの漢字チェックをしました。読みやすい${determinedLevel}レベルの読みものから始めましょう。`
  }
}

export async function POST(request: NextRequest) {
  try {
    const kanjiTestResult: KanjiTestResult = await request.json()
    
    // バリデーション
    if (!kanjiTestResult.grade || kanjiTestResult.grade < 1 || kanjiTestResult.grade > 6) {
      return NextResponse.json({
        success: false,
        message: '漢字テストの学年は1から6の間で指定してください'
      }, { status: 400 })
    }
    
    if (kanjiTestResult.accuracy < 0 || kanjiTestResult.accuracy > 100) {
      return NextResponse.json({
        success: false,
        message: '正答率は0から100の間で指定してください'
      }, { status: 400 })
    }
    
    if (kanjiTestResult.correctCount < 0 || kanjiTestResult.totalQuestions <= 0) {
      return NextResponse.json({
        success: false,
        message: '正解数と総問題数は正の値で指定してください'
      }, { status: 400 })
    }
    
    // 漢字レベルを決定
    const kanjiLevel = determineKanjiLevel(kanjiTestResult)
    const explanation = generateExplanation(kanjiTestResult, kanjiLevel)
    
    // 読解テストは必ず真ん中のレベル（2）から開始
    const startingReadingLevel = 2
    
    const result: DeterminedLevel = {
      kanjiLevel,
      startingReadingLevel,
      explanation,
      nextStep: 'reading-test'
    }
    
    return NextResponse.json({
      success: true,
      message: '読解テストのレベルを決定しました',
      result,
      kanjiTestSummary: {
        testedGrade: kanjiTestResult.grade,
        accuracy: kanjiTestResult.accuracy,
        performance: kanjiTestResult.accuracy >= 80 ? '優秀' : 
                    kanjiTestResult.accuracy >= 60 ? '良好' : '要練習'
      }
    })
    
  } catch (error) {
    console.error('Reading level determination error:', error)
    return NextResponse.json({
      success: false,
      message: '読解レベルの決定に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // テスト用のサンプルデータを返す
    const { searchParams } = new URL(request.url)
    const grade = parseInt(searchParams.get('grade') || '3')
    const accuracy = parseInt(searchParams.get('accuracy') || '75')
    
    const mockResult: KanjiTestResult = {
      grade,
      correctCount: Math.round((accuracy / 100) * 5), // 5問中の正解数
      totalQuestions: 5,
      accuracy
    }
    
    const kanjiLevel = determineKanjiLevel(mockResult)
    const explanation = generateExplanation(mockResult, kanjiLevel)
    
    return NextResponse.json({
      success: true,
      message: 'テスト用のレベル決定結果',
      result: {
        kanjiLevel,
        startingReadingLevel: 2,
        explanation,
        nextStep: 'reading-test'
      },
      mockData: mockResult
    })
    
  } catch (error) {
    console.error('Mock reading level determination error:', error)
    return NextResponse.json({
      success: false,
      message: 'テスト用レベル決定に失敗しました'
    }, { status: 500 })
  }
} 