'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ReadingPassage {
  kanjiLevel: string
  readingLevel: number
  title: string
  passage: string
  description: string
}

interface ReadingResponse {
  success: boolean
  kanjiLevel: string
  readingLevel: number
  passage: ReadingPassage
}

interface FeedbackResponse {
  success: boolean
  kanjiLevel: string
  currentReadingLevel: number
  nextReadingLevel: number
  shouldContinue: boolean
  message: string
  determinedReadingLevel: number | null
}

export default function ReadingTestPage() {
  const router = useRouter()
  const [kanjiLevel, setKanjiLevel] = useState<string | null>(null) // 初期化完了まではnull
  const [currentReadingLevel, setCurrentReadingLevel] = useState(2) // 真ん中から開始
  const [passage, setPassage] = useState<ReadingPassage | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testComplete, setTestComplete] = useState(false)
  const [resultMessage, setResultMessage] = useState('')

  const feedbackOptions = [
    { id: 'very-easy', label: 'とてもかんたん' },
    { id: 'somewhat-easy', label: 'すこしかんたん' },
    { id: 'appropriate', label: 'ちょうどよい' },
    { id: 'somewhat-difficult', label: 'すこしむずかしい' },
    { id: 'very-difficult', label: 'とてもむずかしい' }
  ]

  const fetchPassage = useCallback(async (kanjiLv: string, readingLv: number) => {
    setIsLoading(true)
    setSelectedFeedback('')
    try {
      const response = await fetch(`/api/reading-test?kanjiLevel=${encodeURIComponent(kanjiLv)}&readingLevel=${readingLv}`)
      const data: ReadingResponse = await response.json()
      
      if (data.success) {
        setPassage(data.passage)
      } else {
        console.error('Failed to fetch passage:', data)
      }
    } catch (error) {
      console.error('Error fetching passage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitFeedback = async () => {
    if (!selectedFeedback) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reading-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          kanjiLevel: kanjiLevel,
          readingLevel: currentReadingLevel, 
          feedback: selectedFeedback 
        })
      })
      
      const result: FeedbackResponse = await response.json()
      
      if (result.success) {
        setResultMessage(result.message)
        
        if (result.shouldContinue) {
          // 次のレベルに進む
          setCurrentReadingLevel(result.nextReadingLevel)
          if (kanjiLevel) {
            await fetchPassage(kanjiLevel, result.nextReadingLevel)
          }
        } else {
          // 文章チェック完了 - 結果を保存
          const finalReadingLevel = result.determinedReadingLevel || currentReadingLevel
          localStorage.setItem('readingTestResult', JSON.stringify({
            kanjiLevel: kanjiLevel,
            readingLevel: finalReadingLevel,
            feedback: selectedFeedback
          }))
          setTestComplete(true)
          // 少し待ってからジャンル選択に移行
          setTimeout(() => {
            router.push('/genre-selection')
          }, 3000)
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 漢字テスト結果から漢字レベルを決定する関数
  const determineKanjiLevelFromTest = (grade: number, accuracy: number): string => {
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

  // 初回読み込み時に漢字レベルを決定
  useEffect(() => {
    const kanjiTestResult = localStorage.getItem('kanjiTestResult')
    let determinedKanjiLevel = '中学年' // デフォルト
    
    if (kanjiTestResult) {
      try {
        const result = JSON.parse(kanjiTestResult)
        
        // 新しい形式（既に変換済み）の場合
        if (result.kanjiLevel) {
          determinedKanjiLevel = result.kanjiLevel
        }
        // 古い形式（漢字テストの生データ）の場合
        else if (result.grade && typeof result.accuracy === 'number') {
          determinedKanjiLevel = determineKanjiLevelFromTest(result.grade, result.accuracy)
        }
        // 採点結果形式の場合
        else if (result.score && result.score.accuracy && result.grade) {
          determinedKanjiLevel = determineKanjiLevelFromTest(result.grade, result.score.accuracy)
        }
      } catch (error) {
        console.error('Failed to parse kanjiTestResult:', error)
        // JSONパースエラーの場合はデフォルト値を使用
      }
    }
    
    setKanjiLevel(determinedKanjiLevel)
  }, []) // 初回のみ実行

  // 漢字レベルまたは読解レベルが変更された時に文章を取得
  useEffect(() => {
    if (kanjiLevel) {
      fetchPassage(kanjiLevel, currentReadingLevel)
    }
  }, [kanjiLevel, currentReadingLevel, fetchPassage])

  if (testComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-[#111518] mb-4">読みものチェック完了！</h2>
          <p className="text-[#637c88] mb-6">{resultMessage}</p>
          <p className="text-sm text-[#637c88]">自動的にジャンル選択に移動します...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="ml-1">ホーム</span>
        </button>
      </div>
      
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-4 py-3 mb-6">
          <div className="flex items-center gap-4 text-[#111518]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-[#111518] text-lg font-bold leading-tight tracking-[-0.015em]">EduSelect</h2>
          </div>
        </header>
        
        <div className="px-4">
          <div className="mb-6">
            <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight mb-2">おはなしを読んでみよう！</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-[#637c88]">文章を読み込み中...</div>
            </div>
          ) : passage ? (
            <>
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <p className="text-[#111518] text-base leading-relaxed whitespace-pre-wrap">
                    {passage.passage}
                  </p>
                </div>
                
                {resultMessage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">{resultMessage}</p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="text-[#111518] text-base font-bold mb-4">
                  このお話はどうでしたか？
                </h4>
                
                <div className="space-y-3">
                  {feedbackOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedFeedback === option.id
                          ? 'border-[#47b4ea] bg-blue-50'
                          : 'border-[#dce2e5] hover:border-[#a8b3bb] bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedback"
                        value={option.id}
                        checked={selectedFeedback === option.id}
                        onChange={(e) => setSelectedFeedback(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                          selectedFeedback === option.id
                            ? 'border-[#47b4ea] bg-[#47b4ea]'
                            : 'border-[#dce2e5]'
                        }`}>
                          {selectedFeedback === option.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <h5 className="text-[#111518] text-base font-bold leading-tight">
                          {option.label}
                        </h5>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={submitFeedback}
                  disabled={!selectedFeedback || isSubmitting}
                  className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#47b4ea] text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {isSubmitting ? 'ちょっとまってね...' : 'おくる'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <p className="text-[#637c88]">文章の読み込みに失敗しました</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
