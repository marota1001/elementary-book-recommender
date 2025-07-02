'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface KanjiQuestion {
  _id: string
  grade: number
  question: string
  options: string[]
  correctAnswer: string
  kanji: string
  meaning: string
}

interface ShuffledKanjiQuestion extends KanjiQuestion {
  shuffledOptions: string[]
}

interface KanjiTestResponse {
  success: boolean
  grade: number
  questions: KanjiQuestion[]
  total: number
}

interface ScoreResponse {
  success: boolean
  grade: number
  results: Array<{
    question: string
    kanji: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }>
  score: {
    correct: number
    total: number
    accuracy: number
  }
}

// 配列をシャッフルする関数
const shuffleArray = (array: string[]) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function KanjiTestPage() {
  const router = useRouter()
  const [currentGrade, setCurrentGrade] = useState(1)
  const [questions, setQuestions] = useState<KanjiQuestion[]>([])
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 選択肢をシャッフルした問題のメモ化
  const shuffledQuestions = useMemo((): ShuffledKanjiQuestion[] => {
    return questions.map(question => ({
      ...question,
      shuffledOptions: shuffleArray(question.options)
    }))
  }, [questions])

  const fetchQuestions = useCallback(async (grade: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/kanji-test?grade=${grade}`)
      const data: KanjiTestResponse = await response.json()
      
      if (data.success) {
        setQuestions(data.questions)
      } else {
        console.error('Failed to fetch questions:', data)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitAnswers = async () => {
    setIsSubmitting(true)
    try {
      // answersオブジェクトを配列に変換
      const answerArray = shuffledQuestions.map((_, index) => answers[`grade${currentGrade}-q${index}`] || '')
      
      const response = await fetch('/api/kanji-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          grade: currentGrade, 
          answers: answerArray 
        })
      })
      
      const results: ScoreResponse = await response.json()
      
      if (results.success) {
        const accuracy = results.score.accuracy / 100
        
        // 100%正解のみで次のレベルに進む（1問でも間違ったら現在の学年で終了）
        if (accuracy === 1.0 && currentGrade < 6) {
          // 次の学年に進む
          setCurrentGrade(currentGrade + 1)
          setAnswers({})
          await fetchQuestions(currentGrade + 1)
        } else {
          // テスト終了 - 結果を保存して読解テストに移行
          // 間違いがあった場合は現在の学年レベル、100%正解の場合はその学年レベル
          const determinedGrade = accuracy === 1.0 ? currentGrade : currentGrade
          
          // 学年から漢字レベルを決定
          let kanjiLevel = '中学年' // デフォルト
          if (determinedGrade <= 2) {
            kanjiLevel = '低学年'
          } else if (determinedGrade <= 4) {
            kanjiLevel = '中学年'
          } else {
            kanjiLevel = '高学年'
          }
          
          localStorage.setItem('kanjiTestResult', JSON.stringify({
            kanjiLevel: kanjiLevel,
            grade: determinedGrade,
            accuracy: results.score.accuracy
          }))
          router.push('/reading-test')
        }
      }
    } catch (error) {
      console.error('Error submitting answers:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers({
      ...answers,
      [`grade${currentGrade}-q${questionIndex}`]: answer
    })
  }

  const isAllAnswered = () => {
    return shuffledQuestions.every((_, index) => 
      answers[`grade${currentGrade}-q${index}`]
    )
  }

  useEffect(() => {
    fetchQuestions(currentGrade)
  }, [currentGrade, fetchQuestions])

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
      
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-6">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f3f4] px-10 py-3">
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
        
        <div className="px-4 md:px-8 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">漢字のチェックをしてみよう！</p>
                <p className="text-[#637c88] text-sm font-normal leading-normal">
                  漢字を見て正しい読み方を選んでください。
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="text-[#637c88]">問題を読み込み中...</div>
              </div>
            ) : (
              <div>
                {shuffledQuestions.map((question, index) => (
                  <div key={question._id} className="mb-6 p-6 md:p-8 bg-white rounded-lg border border-[#dce2e5]">
                    <div className="text-center mb-6">
                      <p className="text-[#637c88] text-sm font-normal mb-2">
                        問題 {index + 1}
                      </p>
                      <p className="text-[#111518] text-base font-normal mb-4">
                        この漢字の読み方はどれですか？
                      </p>
                      <div className="text-6xl font-bold text-[#111518] mb-4 p-4 bg-[#f8fafc] rounded-lg border-2 border-[#47b4ea]">
                        {question.kanji}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {question.shuffledOptions.map((option, optionIndex) => (
                        <label
                          key={`question-${index}-option-${optionIndex}-${option}`}
                          className="text-base font-medium leading-normal flex items-center justify-center rounded-xl border border-[#dce2e5] px-4 py-3 text-[#111518] has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#47b4ea] has-[:checked]:bg-[#f0f8ff] relative cursor-pointer hover:bg-[#f8fafc] transition-colors"
                        >
                          {option}
                          <input
                            type="radio"
                            className="invisible absolute"
                            name={`question-${currentGrade}-${index}`}
                            value={option}
                            checked={answers[`grade${currentGrade}-q${index}`] === option}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="flex px-4 py-3 justify-end">
                  <button
                    onClick={submitAnswers}
                    disabled={!isAllAnswered() || isSubmitting}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#47b4ea] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate">
                      {isSubmitting ? '採点中...' : '回答を送信'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
