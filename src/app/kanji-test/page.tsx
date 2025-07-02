'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'

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

// 配列をシャッフルする関数（メモ化）
const shuffleArray = (array: string[]) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 質問コンポーネントをメモ化
const QuestionCard = memo(({ 
  question, 
  questionIndex, 
  currentGrade, 
  selectedAnswer,
  onAnswerChange 
}: {
  question: ShuffledKanjiQuestion
  questionIndex: number
  currentGrade: number
  selectedAnswer?: string
  onAnswerChange: (questionIndex: number, answer: string) => void
}) => {
  const handleChange = useCallback((answer: string) => {
    onAnswerChange(questionIndex, answer)
  }, [questionIndex, onAnswerChange])

  return (
    <div className="mb-6 p-6 md:p-8 bg-white rounded-lg border border-[#dce2e5]">
      <div className="text-center mb-6">
        <p className="text-[#637c88] text-sm font-normal mb-2">
          問題 {questionIndex + 1}
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
            key={`${questionIndex}-${optionIndex}-${option}`}
            className="text-base font-medium leading-normal flex items-center justify-center rounded-xl border border-[#dce2e5] px-4 py-3 text-[#111518] has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#47b4ea] has-[:checked]:bg-[#f0f8ff] relative cursor-pointer hover:bg-[#f8fafc] transition-colors"
          >
            {option}
            <input
              type="radio"
              className="invisible absolute"
              name={`question-${currentGrade}-${questionIndex}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={(e) => handleChange(e.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  )
})

QuestionCard.displayName = 'QuestionCard'

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

  const submitAnswers = useCallback(async () => {
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
  }, [currentGrade, shuffledQuestions, answers, fetchQuestions, router])

  const handleAnswerChange = useCallback((questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [`grade${currentGrade}-q${questionIndex}`]: answer
    }))
  }, [currentGrade])

  const isAllAnswered = useMemo(() => {
    return shuffledQuestions.every((_, index) => 
      answers[`grade${currentGrade}-q${index}`]
    )
  }, [shuffledQuestions, answers, currentGrade])

  useEffect(() => {
    fetchQuestions(currentGrade)
  }, [currentGrade, fetchQuestions])

  if (isLoading) {
    return (
      <Layout title="漢字のチェックをしてみよう！" subtitle="漢字を見て正しい読み方を選んでください。">
        <div className="flex flex-1 justify-center items-center">
          <LoadingSpinner text="問題を読み込み中..." />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="漢字のチェックをしてみよう！" subtitle="漢字を見て正しい読み方を選んでください。">
      <div className="px-4 md:px-8 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col w-full flex-1 max-w-4xl">
          {shuffledQuestions.map((question, index) => (
            <QuestionCard
              key={question._id}
              question={question}
              questionIndex={index}
              currentGrade={currentGrade}
              selectedAnswer={answers[`grade${currentGrade}-q${index}`]}
              onAnswerChange={handleAnswerChange}
            />
          ))}
          
          <div className="flex px-4 py-3 justify-end">
            <button
              onClick={submitAnswers}
              disabled={!isAllAnswered || isSubmitting}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#47b4ea] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {isSubmitting ? '採点中...' : '回答を送信'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
