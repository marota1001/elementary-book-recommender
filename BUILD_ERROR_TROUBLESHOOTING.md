# ビルドエラー トラブルシューティングガイド

このドキュメントは、Next.js + TypeScript プロジェクトでよく発生するビルドエラーとその修正方法をまとめています。

## 目次
1. [TypeScript型エラー](#typescript型エラー)
2. [ESLintエラー](#eslintエラー)
3. [React Hook警告](#react-hook警告)
4. [Next.js警告](#nextjs警告)
5. [一般的な対処法](#一般的な対処法)

---

## TypeScript型エラー

### 1. `any`型の使用エラー
**エラー例:**
```
Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
```

**修正方法:**
```typescript
// ❌ ダメな例
function processData(data: any) {
  return data.someProperty
}

// ✅ 良い例
interface DataType {
  someProperty: string
  // 他のプロパティ...
}

function processData(data: DataType) {
  return data.someProperty
}
```

### 2. Mongooseの`lean()`型エラー
**エラー例:**
```
Type '(FlattenMaps<any> & Required<{ _id: unknown; }> & { __v: number; })[]' 
is not assignable to type 'CustomType[]'
```

**修正方法:**
```typescript
// ❌ ダメな例
const data = await Model.find({}).lean() as CustomType[]

// ✅ 良い例
const data = await Model.find({}).lean() as unknown as CustomType[]
```

**理由:** Mongooseの`lean()`は複雑な型を返すため、`unknown`を経由して安全にキャストする

### 3. インデックス署名エラー
**エラー例:**
```
Element implicitly has an 'any' type because expression of type 'number' 
can't be used to index type
```

**修正方法:**
```typescript
// ❌ ダメな例
const data = {
  1: [...],
  2: [...],
}
const result = data[someNumber] // エラー

// ✅ 良い例
const data: Record<number, SomeType[]> = {
  1: [...],
  2: [...],
}
const result = data[someNumber] || []
```

---

## ESLintエラー

### 1. 未使用変数エラー
**エラー例:**
```
'request' is defined but never used.  @typescript-eslint/no-unused-vars
```

**修正方法:**
```typescript
// ❌ ダメな例
export async function GET(request: NextRequest) {
  // requestを使用していない
  return NextResponse.json({ success: true })
}

// ✅ 良い例
export async function GET() {
  // 不要なパラメータを削除
  return NextResponse.json({ success: true })
}
```

### 2. 不要なESLintディレクティブ
**エラー例:**
```
Unused eslint-disable directive (no problems were reported from 'no-var')
```

**修正方法:**
```typescript
// ❌ ダメな例
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

// ✅ 良い例
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}
```

---

## React Hook警告

### 1. useEffect依存配列警告
**エラー例:**
```
React Hook useEffect has a missing dependency: 'functionName'. 
Either include it or remove the dependency array.
```

**修正方法:**
```typescript
// ❌ ダメな例
const [state, setState] = useState(0)

const fetchData = async () => {
  // 何かの処理
}

useEffect(() => {
  fetchData()
}, [state]) // fetchDataが依存配列にない

// ✅ 良い例
const [state, setState] = useState(0)

const fetchData = useCallback(async () => {
  // 何かの処理
}, []) // 依存関係を明確にする

useEffect(() => {
  fetchData()
}, [state, fetchData]) // 全ての依存関係を含める
```

---

## Next.js警告

### 1. img要素の警告
**エラー例:**
```
Using `<img>` could result in slower LCP and higher bandwidth. 
Consider using `<Image />` from `next/image`
```

**修正方法:**
```typescript
// ❌ ダメな例
<img 
  src={imageSrc} 
  alt="説明" 
  className="h-full w-full object-cover"
/>

// ✅ 良い例
import Image from 'next/image'

<div className="relative h-40">
  <Image 
    src={imageSrc} 
    alt="説明" 
    fill
    className="object-cover"
  />
</div>
```

---

## 一般的な対処法

### ビルドエラーが発生した場合の手順

1. **エラーメッセージを確認**
   ```bash
   npm run build
   ```

2. **エラーの種類を特定**
   - TypeScript型エラー
   - ESLintエラー
   - React Hook警告
   - Next.js警告

3. **段階的に修正**
   - 1つずつエラーを修正
   - 修正後に再度ビルドを実行
   - 新しいエラーが発生していないか確認

4. **型安全性を保つ**
   - `any`型は避ける
   - 適切なインターフェースを定義
   - 必要に応じて`unknown`を経由したキャスト

### よく使用する型定義パターン

```typescript
// API レスポンス型
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Mongoose Document型
interface DocumentType {
  _id: string
  createdAt: Date
  updatedAt: Date
  // その他のフィールド
}

// Record型でオブジェクトの型を定義
const config: Record<string, string> = {
  development: 'dev-config',
  production: 'prod-config'
}
```

### デバッグのコツ

1. **段階的コメントアウト**
   - エラーの原因箇所を特定するため、コードを段階的にコメントアウト

2. **型チェック専用コマンド**
   ```bash
   npx tsc --noEmit
   ```

3. **ESLint専用チェック**
   ```bash
   npx eslint . --ext .ts,.tsx
   ```

---

## まとめ

このガイドを参考に、ビルドエラーが発生した際は：

1. エラーメッセージを正確に読む
2. 該当するセクションを参照する
3. 修正例を参考に段階的に対応する
4. 修正後は必ずビルドテストを実行する

継続的にこのドキュメントを更新し、新しいエラーパターンを追加していくことで、開発効率を向上させることができます。 