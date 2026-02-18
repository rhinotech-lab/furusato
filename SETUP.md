# セットアップガイド

## 重要な注意事項

### PHPバージョンについて

Laravel 12は**PHP 8.2以上**をサポートしています。このプロジェクトでは**PHP 8.3**を使用しています。

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
# Composerの依存関係をインストール
docker compose exec backend composer install

# アプリケーションキーを生成
docker compose exec backend php artisan key:generate

# ストレージの権限を設定
docker compose exec backend bash -c "chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache"

# Sanctumのマイグレーションを公開
docker compose exec backend php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# データベースマイグレーション
docker compose exec backend php artisan migrate

# シーダーを実行（サンプルユーザーを作成）
docker compose exec backend php artisan db:seed
```

### 4. フロントエンドの起動

```bash
# プロジェクトルートで実行
npm install
npm run dev
```

> **注意**: Viteのプロキシ設定により、`/api` へのリクエストは自動的に `http://localhost:8080` に転送されます。個別の環境変数設定は不要です。

## アクセス

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:8080/api |
| MySQL | localhost:3306 |

## デフォルトユーザー

シーダー実行後、以下のユーザーでログインできます:

| ロール | メールアドレス | パスワード |
|---|---|---|
| 管理者 | `admin@example.com` | `password` |
| 制作者 | `creator@example.com` | `password` |
| 自治体ユーザー | `municipality@example.com` | `password` |
| 事業者ユーザー | `business@example.com` | `password` |

## Docker Compose構成

| サービス | コンテナ名 | ポート | 説明 |
|---|---|---|---|
| mysql | furusato_mysql | 3306 | MySQL 8.0 データベース |
| backend | furusato_backend | 8000:9000 | Laravel PHP-FPM |
| nginx | furusato_nginx | 8080:80 | Nginx（Laravel用リバースプロキシ） |

> フロントエンドは `npm run dev` でVite開発サーバーを使用します（ポート3000）。

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
docker compose exec backend bash -c "chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache"
```

### Sanctumのテーブルが見つからない

```bash
# personal_access_tokens テーブルが必要
docker compose exec backend php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
docker compose exec backend php artisan migrate
```

### vendorディレクトリが空

Docker Composeのボリュームマウントにより `vendor` が空になる場合があります:

```bash
docker compose exec backend composer install
```

### キャッシュのクリア

```bash
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
```

### コンテナの再ビルド

```bash
docker compose down
docker compose up --build -d
```

### データベースの完全リセット

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
```
