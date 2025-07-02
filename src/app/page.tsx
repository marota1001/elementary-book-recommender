'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
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
        </header>

        {/* メインコンテンツ */}
        <div className="px-4 md:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 justify-center">
            {/* ヒーローセクション */}
            <div className="flex flex-col items-center text-center mb-20 mt-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#111518]">
                ぴったりの本を<span className="text-[#47b4ea]">見つけよう！</span>
              </h1>
              <p className="text-[#637c88] text-lg max-w-2xl mb-8">
                あなたの漢字力と読解力をチェックして、ぴったりの本をおすすめします。
                自分にあった本を読んで、読書をもっと楽しくしよう！
              </p>
              <button
                onClick={() => router.push('/kanji-test')}
                className="px-8 py-4 bg-[#47b4ea] text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors"
              >
                さっそく始める
              </button>
            </div>

            {/* 3ステップ説明 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2 text-[#111518]">Step 1: 漢字チェック！</h3>
                <p className="text-[#637c88]">
                  小学1〜6年生レベルの漢字テストで、あなたの漢字力をチェックします。
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-xl font-bold mb-2 text-[#111518]">Step 2: お話を読んでみよう！</h3>
                <p className="text-[#637c88]">
                  短い文章を読んで質問に答え、あなたの読解力レベルを確認します。
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2 text-[#111518]">Step 3: どんなお話が好き？</h3>
                <p className="text-[#637c88]">
                  好きな本のジャンルを選んで、あなたにぴったりの本をおすすめします。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* フッター */}
        <footer className="border-t border-solid border-t-[#f0f3f4] px-10 py-4 text-center text-[#637c88] text-sm">
          EduSelect - 小学生のための選書サービス
        </footer>
      </div>
    </div>
  )
}
