# クイックスタートガイド

## ローカル開発環境の起動

### 1. バックエンド（Docker Compose）

```bash
# Docker Composeで起動
docker compose up --build -d

# Laravelの初期設定
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend bash -c "chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache"
docker compose exec backend php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
```

### 2. フロントエンド

```bash
npm install
npm run dev
```

### 3. アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8080/api

### 4. ログイン

| ロール | メールアドレス | パスワード |
|---|---|---|
| 管理者 | admin@example.com | password |
| 制作者 | creator@example.com | password |
| 自治体ユーザー | municipality@example.com | password |
| 事業者ユーザー | business@example.com | password |

## GCP本番環境のセットアップ

### セットアップ
```bash
# 基本リソース作成
./scripts/setup/setup-gcp.sh redhorse-prod

# 環境変数・接続設定
./scripts/setup/run-next-steps.sh
```

### 確認
```bash
# セットアップ状況確認
./scripts/verify/check-setup-status.sh redhorse-prod

# 環境変数確認
./scripts/verify/check-env-var.sh redhorse-prod
```

### デプロイ
```bash
# デプロイ状況確認
./scripts/deploy/check-deployment.sh redhorse-prod

# リアルタイム監視
./scripts/deploy/watch-deployment.sh redhorse-prod
```

### トラブルシューティング
```bash
# バケット名修正
./scripts/fix/fix-storage-bucket.sh redhorse-prod

# 環境変数修正
./scripts/fix/fix-env-var.sh redhorse-prod
```
