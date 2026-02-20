# 開発ガイド

## 前提条件

- PHP 8.3以上（Laravel 12の要件）
- Node.js 20以上
- MySQL 8.0以上
- Composer
- npm
- Docker & Docker Compose

## プロジェクト構造

```
.
├── backend/              # Laravel 12 バックエンド
│   ├── app/
│   │   ├── Http/         # コントローラー・ミドルウェア
│   │   ├── Models/       # Eloquent モデル
│   │   └── Providers/    # サービスプロバイダ
│   ├── config/           # Laravel 設定
│   ├── database/
│   │   ├── migrations/   # DBマイグレーション
│   │   └── seeders/      # シーダー
│   ├── routes/           # APIルート
│   └── Dockerfile        # バックエンド Docker 定義
├── pages/                # React ページコンポーネント
│   ├── Dashboard.tsx     # ホーム
│   ├── ImageList.tsx     # プロジェクト一覧
│   ├── ImageDetail.tsx   # 画像詳細・チャット
│   ├── ImageUpload.tsx   # 新規画像登録
│   ├── ImageRevisionList.tsx  # 画像改修状況
│   ├── ImageCollection.tsx    # 素材回収状況
│   ├── MunicipalityList.tsx   # 自治体一覧
│   ├── MunicipalityForm.tsx   # 自治体フォーム
│   ├── BusinessList.tsx       # 事業者一覧
│   ├── BusinessForm.tsx       # 事業者フォーム（削除機能付き）
│   ├── ProductList.tsx        # 商品一覧
│   ├── ProductForm.tsx        # 商品フォーム
│   ├── AlertList.tsx          # 要対応案件
│   ├── NotificationList.tsx   # 通知履歴
│   ├── ReportGenerator.tsx    # 月次報告書
│   ├── AccountSettings.tsx    # アカウント設定
│   ├── MobileSimPreview.tsx   # モバイルプレビュー
│   └── Login.tsx              # ログイン
├── components/           # 共通 React コンポーネント
│   ├── Layout.tsx        # メインレイアウト（サイドバー・ヘッダー）
│   └── StatusBadge.tsx   # ステータスバッジ
├── context/
│   └── AuthContext.tsx   # 認証コンテキスト
├── services/
│   ├── api.ts            # API クライアント
│   └── mockDb.ts         # モックデータ（localStorage永続化）
├── types.ts              # 型定義
├── App.tsx               # ルーティング定義
├── index.tsx             # エントリポイント
├── docker-compose.yml    # Docker Compose 定義
├── vite.config.ts        # Vite 設定
└── package.json          # フロントエンド依存関係
```

## ローカル開発

### バックエンド（Docker Compose）

1. Docker Composeで起動:
   ```bash
   docker compose up --build -d
   ```

2. Composerの依存関係をインストール:
   ```bash
   docker compose exec backend composer install
   ```

3. Laravelの初期設定:
   ```bash
   docker compose exec backend php artisan key:generate
   docker compose exec backend bash -c "chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache"
   docker compose exec backend php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   docker compose exec backend php artisan migrate
   docker compose exec backend php artisan db:seed
   ```

4. APIアクセス確認:
   ```bash
   curl -H "Accept: application/json" http://localhost:8080/api/login \
     -X POST -d '{"email":"admin@example.com","password":"password"}' \
     -H "Content-Type: application/json"
   ```

### フロントエンド（Vite 開発サーバー）

1. 依存関係をインストール:
   ```bash
   npm install
   ```

2. 開発サーバーを起動:
   ```bash
   npm run dev
   ```
   フロントエンドは http://localhost:3000 で起動します。

   **注意**: Viteのプロキシ設定により、`/api` へのリクエストは自動的に `http://localhost:8080` に転送されます。

## ビルド

### フロントエンド
```bash
npm run build
```
出力は `dist/` に生成されます。

## Docker Compose構成

| サービス | コンテナ名 | ポート | 説明 |
|---|---|---|---|
| mysql | furusato_mysql | 3306 | MySQL 8.0 データベース |
| backend | furusato_backend | 8000:9000 | Laravel PHP-FPM |
| nginx | furusato_nginx | 8080:80 | Nginx（Laravel用リバースプロキシ） |

> **注意**: フロントエンドは `npm run dev` で起動します（Docker Composeのfrontendサービスはコメントアウト済み）。

## データベース

### マイグレーション

```bash
docker compose exec backend php artisan migrate
```

### ロールバック

```bash
docker compose exec backend php artisan migrate:rollback
```

### シーダー

```bash
docker compose exec backend php artisan db:seed
```

### 完全リセット

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
```

## 認証

このシステムは Laravel Sanctum を使用してトークンベースの認証を実装しています。

### ログイン

```typescript
import { authApi } from './services/api';

const response = await authApi.login('admin@example.com', 'password');
// response.token を localStorage に保存
```

### 認証が必要なリクエスト

APIクライアント（`services/api.ts`）は自動的にトークンをAuthorizationヘッダーに追加します。

### デフォルトユーザー

| ロール | メールアドレス | パスワード |
|---|---|---|
| 管理者 | admin@example.com | password |
| 制作者 | creator@example.com | password |
| 自治体ユーザー | municipality@example.com | password |
| 事業者ユーザー | business@example.com | password |

## UI統一ルール

各ページのUI/UXは以下のルールに従って統一されています：

- **ページタイトル**: `text-xl font-black text-slate-900 tracking-tighter`（サイドバーの名称と一致）
- **テーブルセル**: `px-3 py-3`（共通パディング）
- **テーブルヘッダー**: `text-[10px] font-black uppercase tracking-widest text-slate-400`
- **カード角丸**: `rounded-xl` または `rounded-[1.5rem]`
- **本文テキスト**: `text-[13px]` ～ `text-[14px]`
- **サブテキスト**: `text-[10px]` ～ `text-[11px]`
- **共通レイアウト**: `Layout.tsx` で `px-8 lg:px-12 py-8` の共通パディングを提供

## テスト

### バックエンド

```bash
docker compose exec backend php artisan test
```

### フロントエンド

```bash
npm test
```
