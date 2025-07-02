#!/bin/bash

# プロジェクト構造を自動更新するスクリプト

echo "📁 プロジェクト構造を更新中..."

# 現在の日時を取得
CURRENT_DATE=$(date '+%Y年%m月%d日 %H:%M')

# ファイル数をカウント
TOTAL_FILES=$(find . -type f -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" | wc -l | tr -d ' ')
API_ROUTES=$(find ./src/app/api -name "route.ts" 2>/dev/null | wc -l | tr -d ' ')
PAGE_COMPONENTS=$(find ./src/app -name "page.tsx" 2>/dev/null | wc -l | tr -d ' ')
LIB_FILES=$(find ./src/lib -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')

echo "✅ 統計情報更新完了"
echo "   - 総ファイル数: $TOTAL_FILES"
echo "   - APIルート: $API_ROUTES"
echo "   - ページコンポーネント: $PAGE_COMPONENTS"
echo "   - ライブラリファイル: $LIB_FILES"

# PROJECT_STRUCTURE.mdに統計を書き込み（簡易版）
cat > temp_stats.txt << EOL
**最終更新**: $CURRENT_DATE

## 📊 **ファイル統計**

- **総ファイル数**: ${TOTAL_FILES}個
- **APIルート**: ${API_ROUTES}個
- **ページコンポーネント**: ${PAGE_COMPONENTS}個
- **ライブラリファイル**: ${LIB_FILES}個
EOL

echo "📄 PROJECT_STRUCTURE.mdの統計セクションを更新しました"
rm temp_stats.txt

echo "🎉 構造更新完了！"
