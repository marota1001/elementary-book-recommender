'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'

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

// メッセージコンポーネントをメモ化
const ChatMessageComponent = memo(({ 
  message, 
  index 
}: {
  message: ChatMessage
  index: number
}) => {
  const isUser = message.role === 'user'
  
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isUser
            ? 'bg-[#47b4ea] text-white'
            : 'bg-gray-100 text-[#111518]'
        }`}
      >
        {!isUser && (
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
  )
})

ChatMessageComponent.displayName = 'ChatMessageComponent'

// ローディングメッセージコンポーネントをメモ化
const LoadingMessage = memo(() => (
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
))

LoadingMessage.displayName = 'LoadingMessage'

// キーワード抽出中の表示コンポーネントをメモ化
const KeywordExtractionProgress = memo(({ 
  extractedKeywords 
}: {
  extractedKeywords: string[]
}) => (
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
))

KeywordExtractionProgress.displayName = 'KeywordExtractionProgress'

// 完了状態の表示コンポーネントをメモ化
const CompletionView = memo(({ 
  onExtractKeywords,
  isExtracting 
}: {
  onExtractKeywords: () => void
  isExtracting: boolean
}) => (
  <div className="text-center">
    <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
      <p className="font-medium">ありがとうございました！</p>
      <p className="text-sm">質問が完了しました。あなたの興味を分析してぴったりの本を探します。</p>
    </div>
    <button
      onClick={onExtractKeywords}
      disabled={isExtracting}
      className="px-6 py-3 bg-[#47b4ea] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExtracting ? '分析中...' : 'おすすめの本を見る'}
    </button>
  </div>
))

CompletionView.displayName = 'CompletionView'

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
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // 初期化: 最初の質問を取得
  const initializeChat = useCallback(async () => {
    try {
      const response = await fetch('/api/chat')
      const data: ChatResponse = await response.json()
      
      if (data.success) {
        setMessages(data.conversationHistory)
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
    }
  }, [])

  // メッセージ送信
  const sendMessage = useCallback(async () => {
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
  }, [currentMessage, messages])

  // キーワード抽出と推薦ページへの移行
  const extractKeywordsAndProceed = useCallback(async () => {
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
  }, [messages, router])

  // Enterキーでメッセージ送信
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    initializeChat()
  }, [initializeChat])

  // メッセージリストをメモ化
  const messageList = useMemo(() => {
    return messages.map((message, index) => (
      <ChatMessageComponent
        key={index}
        message={message}
        index={index}
      />
    ))
  }, [messages])

  return (
    <Layout>
      <div className="flex flex-1 flex-col">
        {/* タイトルエリア */}
        <div className="px-4 py-6 border-b border-gray-200">
          <div className="flex justify-center">
            <div className="max-w-4xl w-full">
              <h1 className="text-2xl font-bold text-[#111518] mb-2">あなたのことを教えてください！</h1>
              <p className="text-[#637c88]">いくつか質問をしますので、自由に答えてくださいね。あなたにぴったりの本を見つけるために使います。</p>
            </div>
          </div>
        </div>

        {/* チャットエリア */}
        <div className="flex flex-1 justify-center">
          <div className="flex flex-col max-w-4xl w-full">
            {/* メッセージ一覧 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messageList}
              
              {/* ローディング表示 */}
              {isLoading && <LoadingMessage />}

              {/* キーワード抽出中の表示 */}
              {isExtracting && (
                <KeywordExtractionProgress extractedKeywords={extractedKeywords} />
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="border-t border-gray-200 p-4">
              {!isComplete ? (
                <div className="flex space-x-2">
                  <textarea
                    value={currentMessage}
                    onChange={handleMessageChange}
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
                <CompletionView
                  onExtractKeywords={extractKeywordsAndProceed}
                  isExtracting={isExtracting}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 