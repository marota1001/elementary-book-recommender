'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'

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

// フィードバックオプションコンポーネントをメモ化
const FeedbackOption = memo(({ 
  option, 
  selectedFeedback, 
  onSelect 
}: {
  option: { id: string; label: string }
  selectedFeedback: string
  onSelect: (id: string) => void
}) => {
  const handleSelect = useCallback(() => {
    onSelect(option.id)
  }, [option.id, onSelect])

  const isSelected = selectedFeedback === option.id

  return (
    <label
      className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-[#47b4ea] bg-blue-50'
          : 'border-[#dce2e5] hover:border-[#a8b3bb] bg-white'
      }`}
    >
      <input
        type="radio"
        name="feedback"
        value={option.id}
        checked={isSelected}
        onChange={handleSelect}
        className="sr-only"
      />
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
          isSelected
            ? 'border-[#47b4ea] bg-[#47b4ea]'
            : 'border-[#dce2e5]'
        }`}>
          {isSelected && (
            <div className="w-full h-full rounded-full bg-white scale-50"></div>
          )}
        </div>
        <h5 className="text-[#111518] text-base font-bold leading-tight">
          {option.label}
        </h5>
      </div>
    </label>
  )
})

FeedbackOption.displayName = 'FeedbackOption'

// 完了画面コンポーネントをメモ化
const CompletionScreen = memo(({ resultMessage }: { resultMessage: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="text-4xl mb-4">🎉</div>
      <h2 className="text-xl font-bold text-[#111518] mb-4">読みものチェック完了！</h2>
      <p className="text-[#637c88] mb-6">{resultMessage}</p>
      <p className="text-sm text-[#637c88]">自動的にジャンル選択に移動します...</p>
    </div>
  </div>
))

CompletionScreen.displayName = 'CompletionScreen'

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

  const feedbackOptions = useMemo(() => [
    { id: 'very-easy', label: 'とてもかんたん' },
    { id: 'somewhat-easy', label: 'すこしかんたん' },
    { id: 'appropriate', label: 'ちょうどよい' },
    { id: 'somewhat-difficult', label: 'すこしむずかしい' },
    { id: 'very-difficult', label: 'とてもむずかしい' }
  ], [])

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

  const submitFeedback = useCallback(async () => {
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
  }, [selectedFeedback, kanjiLevel, currentReadingLevel, fetchPassage, router])

  // 漢字テスト結果から漢字レベルを決定する関数
  const determineKanjiLevelFromTest = useCallback((grade: number, accuracy: number): string => {
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
  }, [])

  const handleFeedbackSelect = useCallback((id: string) => {
    setSelectedFeedback(id)
  }, [])

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
  }, [determineKanjiLevelFromTest]) // determineKanjiLevelFromTestは依存関係に追加

  // 漢字レベルまたは読解レベルが変更された時に文章を取得
  useEffect(() => {
    if (kanjiLevel) {
      fetchPassage(kanjiLevel, currentReadingLevel)
    }
  }, [kanjiLevel, currentReadingLevel, fetchPassage])

  if (testComplete) {
    return <CompletionScreen resultMessage={resultMessage} />
  }

  if (isLoading) {
    return (
      <Layout title="おはなしを読んでみよう！">
        <div className="flex flex-1 justify-center items-center">
          <LoadingSpinner text="文章を読み込み中..." />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="おはなしを読んでみよう！">
      <div className="flex flex-1 justify-center py-5">
        <div className="px-4 max-w-2xl w-full">
          {passage ? (
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
                    <FeedbackOption
                      key={option.id}
                      option={option}
                      selectedFeedback={selectedFeedback}
                      onSelect={handleFeedbackSelect}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pb-6">
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
    </Layout>
  )
}
