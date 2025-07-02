'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Genre {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  keywords: string[]
}

interface GenreResponse {
  success: boolean
  genres: Genre[]
  total: number
}

interface SelectionResponse {
  success: boolean
  message: string
  selectedGenres: Genre[]
  keywords: string[]
  summary: {
    count: number
    names: string[]
  }
}

export default function GenreSelectionPage() {
  const router = useRouter()
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchGenres = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/genres')
      const data: GenreResponse = await response.json()
      
      if (data.success) {
        setGenres(data.genres)
      } else {
        console.error('Failed to fetch genres:', data)
      }
    } catch (error) {
      console.error('Error fetching genres:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId)
      } else {
        // 最大3つまで選択可能
        if (prev.length < 3) {
          return [...prev, genreId]
        }
        return prev
      }
    })
  }

  const submitSelection = async () => {
    if (selectedGenres.length === 0) {
      alert('少なくとも1つのジャンルを選択してください')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedGenres })
      })
      
      const results: SelectionResponse = await response.json()
      
      if (results.success) {
        // テスト結果をlocalStorageから取得（将来的に使用予定）
        const kanjiTestResult = localStorage.getItem('kanjiTestResult')
        const readingTestResult = localStorage.getItem('readingTestResult')
        
        // 現在は使用していませんが、将来的にレベル調整に使用します
        console.log('Test results stored:', { kanjiTestResult, readingTestResult })
        
        // ジャンル選択を保存
        localStorage.setItem('genreSelection', JSON.stringify(selectedGenres))
        
        // チャット対話ページに移行
        router.push('/chat-interview')
      } else {
        alert('ジャンル選択の処理に失敗しました')
      }
    } catch (error) {
      console.error('Error submitting selection:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchGenres()
  }, [])

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
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
          <div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <span className="mr-1">ホーム</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
          </div>
        </header>
        
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#111518] tracking-light text-[32px] font-bold leading-tight">好きなジャンルを選んでね！</p>
                <p className="text-[#637c88] text-sm font-normal leading-normal">
                  興味のあるジャンルを選択してください。複数選択できます！
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="text-[#637c88]">ジャンルを読み込み中...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4">
                  {genres.map((genre) => (
                    <div
                      key={genre.id}
                      onClick={() => handleGenreToggle(genre.id)}
                      className={`
                        flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${selectedGenres.includes(genre.id)
                          ? 'border-[#47b4ea] bg-[#47b4ea]/10 shadow-lg'
                          : 'border-[#dce2e5] hover:border-[#47b4ea]/50 hover:shadow-md'
                        }
                      `}
                    >
                      {/* アイコンとチェックボックス */}
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center justify-center w-12 h-12 rounded-full text-2xl"
                          style={{ backgroundColor: `${genre.color}20` }}
                        >
                          {genre.emoji}
                        </div>
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${selectedGenres.includes(genre.id)
                            ? 'border-[#47b4ea] bg-[#47b4ea]'
                            : 'border-[#dce2e5]'
                          }
                        `}>
                          {selectedGenres.includes(genre.id) && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      {/* ジャンル名と説明 */}
                      <div>
                        <h3 className="text-[#111518] text-lg font-bold leading-tight mb-2">
                          {genre.name}
                        </h3>
                        <p className="text-[#637c88] text-sm leading-normal">
                          {genre.description}
                        </p>
                      </div>
                      
                      {/* キーワード */}
                      <div className="flex flex-wrap gap-1">
                        {genre.keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ 
                              backgroundColor: `${genre.color}20`,
                              color: genre.color
                            }}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 選択状況表示 */}
                {selectedGenres.length > 0 && (
                  <div className="p-4">
                    <div className="bg-[#47b4ea]/10 rounded-xl p-4">
                      <p className="text-[#111518] font-medium mb-2">
                        選択中: {selectedGenres.length}個のジャンル
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedGenres.map(genreId => {
                          const genre = genres.find(g => g.id === genreId)
                          return genre ? (
                            <span
                              key={genreId}
                              className="px-3 py-1 bg-[#47b4ea] text-white text-sm rounded-full"
                            >
                              {genre.emoji} {genre.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex px-4 py-3 justify-end">
                  <button
                    onClick={submitSelection}
                    disabled={selectedGenres.length === 0 || isSubmitting}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#47b4ea] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate">
                      {isSubmitting ? '処理中...' : '本を探す'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
