# セットアップガイド

## 重要な注意事項

### PHPバージョンについて

ご指定の**PHP 8.5**は現在存在しません。Laravel 12は**PHP 8.2以上**をサポートしています。

このプロジェクトでは**PHP 8.3**を使用しています。実際の環境でPHP 8.5が利用可能になった場合は、Dockerfileを更新してください。

## 初回セットアップ

### 1. 環境変数の設定

```bash
cd backend
cp .env.example .env
```

`backend/.env` ファイルを編集して、以下の設定を確認・変更してください:

```env
APP_NAME="ふるさと納税制作管理システム"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=furusato_db
DB_USERNAME=furusato_user
DB_PASSWORD=furusato_password
```

### 2. Docker Composeで起動

```bash
docker compose up --build -d
```

### 3. Laravelの初期設定

```bash
# バックエンドコンテナに入る
docker compose exec backend bash

# アプリケーションキーを生成
php artisan key:generate

# データベースマイグレーション
php artisan migrate

# シーダーを実行（サンプルユーザーを作成）
php artisan db:seed
```

### 4. フロントエンドの環境変数（オプション）

`.env.local` ファイルを作成:

```env
VITE_API_URL=http://localhost:8080/api
GEMINI_API_KEY=your_api_key_here
```

## アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080/api
- **MySQL**: localhost:3306

## デフォルトユーザー

シーダー実行後、以下のユーザーでログインできます:

- **管理者**: `admin@example.com` / `password`
- **自治体ユーザー**: `municipality@example.com` / `password`
- **事業者ユーザー**: `business@example.com` / `password`

## トラブルシューティング

### データベース接続エラー

```bash
# MySQLコンテナの状態を確認
docker compose ps mysql

# ログを確認
docker compose logs mysql
```

### Laravelの権限エラー

```bash
docker compose exec backend bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### コンテナの再ビルド

```bash
docker compose down
docker compose up --build
```
