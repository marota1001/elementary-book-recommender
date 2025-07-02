'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  success: boolean
  response: string
  conversationHistory: ChatMessage[]
  isComplete: boolean
  nextQuestion?: string
}

interface KeywordExtractionResponse {
  success: boolean
  keywords: string[]
  confidence: number
  reasoning: string
  isComplete: boolean
}

export default function ChatInterviewPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // メッセージリストの最下部にスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初期化: 最初の質問を取得
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await fetch('/api/chat')
        const data: ChatResponse = await response.json()
        
        if (data.success) {
          setMessages(data.conversationHistory)
        }
      } catch (error) {
        console.error('Error initializing chat:', error)
      }
    }

    initializeChat()
  }, [])

  // メッセージ送信
  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = currentMessage
    setCurrentMessage('')
    
    // ユーザーメッセージを即座に表示
    const newUserMessage = { role: 'user' as const, content: userMessage }
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          conversationHistory: messages,
          mode: 'conversation'
        })
      })

      const data: ChatResponse = await response.json()
      
      if (data.success) {
        // AIの返答のみを追加
        const aiMessage = { role: 'assistant' as const, content: data.response }
        setMessages([...updatedMessages, aiMessage])
        setIsComplete(data.isComplete)
      } else {
        console.error('Chat error:', data)
        // エラー時は元に戻す
        setMessages(messages)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // エラー時は元に戻す
      setMessages(messages)
    } finally {
      setIsLoading(false)
    }
  }

  // キーワード抽出と推薦ページへの移行
  const extractKeywordsAndProceed = async () => {
    setIsExtracting(true)

    try {
      // キーワード抽出
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: '', // 最後のメッセージは空文字列
          conversationHistory: messages,
          mode: 'extract_keywords'
        })
      })

      const data: KeywordExtractionResponse = await response.json()
      
      if (data.success) {
        setExtractedKeywords(data.keywords)
        
        // キーワードをlocalStorageに保存
        localStorage.setItem('extractedKeywords', JSON.stringify(data.keywords))
        
        // 少し待ってから推薦ページに移行
        setTimeout(() => {
          router.push('/recommendations')
        }, 2000)
      } else {
        console.error('Keyword extraction error:', data)
      }
    } catch (error) {
      console.error('Error extracting keywords:', error)
    } finally {
      setIsExtracting(false)
    }
  }

  // Enterキーでメッセージ送信
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        {/* ヘッダー */}
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

        {/* メインコンテンツ */}
        <div className="flex flex-1 flex-col">
          {/* タイトルエリア */}
          <div className="px-4 py-6 border-b border-gray-200">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-[#111518] mb-2">あなたのことを教えてください！</h1>
              <p className="text-[#637c88]">いくつか質問をしますので、自由に答えてくださいね。あなたにぴったりの本を見つけるために使います。</p>
            </div>
          </div>

          {/* チャットエリア */}
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            {/* メッセージ一覧 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-[#47b4ea] text-white'
                        : 'bg-gray-100 text-[#111518]'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-[#47b4ea] rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs">🤖</span>
                        </div>
                        <span className="text-sm font-medium">AI先生</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* ローディング表示 */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-[#47b4ea] rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">🤖</span>
                      </div>
                      <span className="text-sm font-medium mr-2">AI先生</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* キーワード抽出中の表示 */}
              {isExtracting && (
                <div className="flex justify-center">
                  <div className="bg-[#47b4ea]/10 p-4 rounded-lg text-center">
                    <div className="mb-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#47b4ea] mx-auto"></div>
                    </div>
                    <p className="text-[#47b4ea] font-medium">あなたの興味を分析しています...</p>
                    {extractedKeywords.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">見つかったキーワード:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {extractedKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-[#47b4ea] text-white text-sm rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="border-t border-gray-200 p-4">
              {!isComplete ? (
                <div className="flex space-x-2">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="メッセージを入力してください..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#47b4ea] focus:border-transparent"
                    rows={1}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                    className="px-4 py-2 bg-[#47b4ea] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    送信
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                    <p className="font-medium">ありがとうございました！</p>
                    <p className="text-sm">質問が完了しました。あなたの興味を分析してぴったりの本を探します。</p>
                  </div>
                  <button
                    onClick={extractKeywordsAndProceed}
                    disabled={isExtracting}
                    className="px-6 py-3 bg-[#47b4ea] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExtracting ? '分析中...' : 'おすすめの本を見る'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 