'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'

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

// ジャンルカードコンポーネントをメモ化
const GenreCard = memo(({ 
  genre, 
  isSelected, 
  onToggle 
}: {
  genre: Genre
  isSelected: boolean
  onToggle: (genreId: string) => void
}) => {
  const handleToggle = useCallback(() => {
    onToggle(genre.id)
  }, [genre.id, onToggle])

  return (
    <div
      onClick={handleToggle}
      className={`
        flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${isSelected
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
          ${isSelected
            ? 'border-[#47b4ea] bg-[#47b4ea]'
            : 'border-[#dce2e5]'
          }
        `}>
          {isSelected && (
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
  )
})

GenreCard.displayName = 'GenreCard'

// 選択状況表示コンポーネントをメモ化
const SelectionStatus = memo(({ 
  selectedGenres, 
  genres 
}: {
  selectedGenres: string[]
  genres: Genre[]
}) => {
  const selectedGenreDetails = useMemo(() => {
    return selectedGenres.map(genreId => genres.find(g => g.id === genreId)).filter(Boolean) as Genre[]
  }, [selectedGenres, genres])

  if (selectedGenres.length === 0) return null

  return (
    <div className="p-4">
      <div className="bg-[#47b4ea]/10 rounded-xl p-4">
        <p className="text-[#111518] font-medium mb-2">
          選択中: {selectedGenres.length}個のジャンル
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedGenreDetails.map(genre => (
            <span
              key={genre.id}
              className="px-3 py-1 bg-[#47b4ea] text-white text-sm rounded-full"
            >
              {genre.emoji} {genre.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
})

SelectionStatus.displayName = 'SelectionStatus'

export default function GenreSelectionPage() {
  const router = useRouter()
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchGenres = useCallback(async () => {
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
  }, [])

  const handleGenreToggle = useCallback((genreId: string) => {
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
  }, [])

  const submitSelection = useCallback(async () => {
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
  }, [selectedGenres, router])

  const isSubmitDisabled = useMemo(() => {
    return selectedGenres.length === 0 || isSubmitting
  }, [selectedGenres.length, isSubmitting])

  useEffect(() => {
    fetchGenres()
  }, [fetchGenres])

  if (isLoading) {
    return (
      <Layout title="好きなジャンルを選んでね！" subtitle="興味のあるジャンルを選択してください。複数選択できます！">
        <div className="flex flex-1 justify-center items-center">
          <LoadingSpinner text="ジャンルを読み込み中..." />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="好きなジャンルを選んでね！" subtitle="興味のあるジャンルを選択してください。複数選択できます！">
      <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4">
            {genres.map((genre) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                isSelected={selectedGenres.includes(genre.id)}
                onToggle={handleGenreToggle}
              />
            ))}
          </div>
          
          <SelectionStatus selectedGenres={selectedGenres} genres={genres} />
          
          <div className="flex px-4 py-3 justify-end">
            <button
              onClick={submitSelection}
              disabled={isSubmitDisabled}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#47b4ea] text-[#111518] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {isSubmitting ? '処理中...' : '本を探す'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
