# 開発ガイド

## 前提条件

- PHP 8.3以上（Laravel 12の要件）
- Node.js 20以上
- MySQL 8.0以上
- Composer
- npm

## プロジェクト構造

```
.
├── backend/          # Laravel 12 バックエンド
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── ...
├── pages/            # React ページコンポーネント
├── components/       # React コンポーネント
├── services/         # API クライアント
└── ...
```

## ローカル開発

### バックエンド

1. 依存関係をインストール:
   ```bash
   cd backend
   composer install
   ```

2. 環境変数を設定:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. データベースをセットアップ:
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

4. 開発サーバーを起動:
   ```bash
   php artisan serve
   ```

### フロントエンド

1. 依存関係をインストール:
   ```bash
   npm install
   ```

2. 環境変数を設定:
   `.env.local` ファイルを作成:
   ```
   VITE_API_URL=http://localhost:8000/api
   GEMINI_API_KEY=your_api_key_here
   ```

3. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

## ビルド

### フロントエンド
```bash
npm run build
```
出力は `dist/` に生成されます。

## Docker

### Compose で起動
```bash
docker compose up --build
```

### 単体で起動

#### フロントエンド
```bash
docker build -f Dockerfile.frontend -t furusato-frontend .
docker run --rm -p 3000:80 furusato-frontend
```

#### バックエンド
```bash
cd backend
docker build -t furusato-backend .
docker run --rm -p 8000:9000 furusato-backend
```

## データベース

### マイグレーション

```bash
php artisan migrate
```

### ロールバック

```bash
php artisan migrate:rollback
```

### シーダー

```bash
php artisan db:seed
```

## 認証

このシステムは Laravel Sanctum を使用してトークンベースの認証を実装しています。

### ログイン

```typescript
import { authApi } from './services/api';

await authApi.login('email@example.com', 'password');
```

### 認証が必要なリクエスト

APIクライアントは自動的にトークンをヘッダーに追加します。

## テスト

### バックエンド

```bash
php artisan test
```

### フロントエンド

```bash
npm test
```
