# 本番環境セットアップ完了状況

## 作成済みファイル

### 設定ファイル
- ✅ `cloudbuild.yaml` - Cloud Build のビルド設定
- ✅ `.gcloudignore` - Cloud Build で無視するファイル
- ✅ `docker-compose.yml` - ローカル開発用 Docker Compose
- ✅ `Dockerfile` - フロントエンド用 Docker 定義
- ✅ `Dockerfile.frontend` - フロントエンドビルド用
- ✅ `backend/Dockerfile` - バックエンド用 Docker 定義
- ✅ `nginx-backend.conf` - Nginx 設定（Laravel用）

### スクリプト
- ✅ `scripts/setup/setup-gcp.sh` - 基本リソース作成（手順1-5）
- ✅ `scripts/setup/run-next-steps.sh` - 環境変数・接続設定（手順6）
- ✅ `scripts/verify/check-setup-status.sh` - セットアップ状況確認

## 手順別完了状況

### ✅ 手順1: 必要な API を有効化
- スクリプト: `scripts/setup/setup-gcp.sh` で自動実行可能
- 実行コマンド: `./scripts/setup/setup-gcp.sh redhorse-prod`

### ✅ 手順2: Artifact Registry 作成
- スクリプト: `scripts/setup/setup-gcp.sh` で自動実行可能
- リポジトリ名: `app-images`
- リージョン: `asia-northeast1`

### ✅ 手順3: Cloud SQL (MySQL) 作成
- スクリプト: `scripts/setup/setup-gcp.sh` で自動実行可能
- インスタンス名: `app-mysql`
- データベース名: `app_db`
- ユーザー名: `app_user`

### ✅ 手順4: Cloud Storage バケット作成
- スクリプト: `scripts/setup/setup-gcp.sh` で自動実行可能
- バケット名: `furusato-storage-<project-id>` (プロジェクトIDを含む一意な名前)

### ✅ 手順5: Cloud Run サービス作成
- スクリプト: `scripts/setup/setup-gcp.sh` で自動実行可能
- サービス名: `furusato-frontend`
- ポート: `8080`

### ⚠️ 手順6: 環境変数の設定
- スクリプト: `scripts/setup/run-next-steps.sh` で実行可能
- 必要な環境変数:
  - `APP_KEY` (Laravel アプリケーションキー)
  - `DB_HOST` (Cloud SQL 接続名)
  - `DB_NAME` (app_db)
  - `DB_USER` (app_user)
  - `DB_PASSWORD` (setup-gcp.shで生成)
  - `GCS_BUCKET` (furusato-storage-<project-id>)
- Cloud SQL 接続の紐付けも含む

### ⚠️ 手順7: GitHub と Cloud Build の連携
- 手動設定が必要
- GitHub接続の作成が必要
- Cloud Build トリガーの作成が必要
- 詳細: `scripts/EXECUTE_NEXT_STEPS.md` を参照

### ✅ 手順8: リリースフロー
- ドキュメント化済み
- GitHub push → Cloud Build → Cloud Run デプロイ

## 実行方法

### セットアップ状況を確認
```bash
./scripts/verify/check-setup-status.sh redhorse-prod
```

### 基本リソースを作成（手順1-5）
```bash
./scripts/setup/setup-gcp.sh redhorse-prod
```

### 環境変数・接続を設定（手順6）
```bash
./scripts/setup/run-next-steps.sh
```

### Cloud Build トリガーを作成（手順7）
詳細は `scripts/EXECUTE_NEXT_STEPS.md` を参照してください。

## 注意事項

- プロジェクトIDは `redhorse-prod` に設定されています
- MySQLパスワードは `setup-gcp.sh` 実行時に生成されます（安全に保管してください）
- GitHub接続は初回のみ手動で作成が必要です
- Secret Manager の使用を推奨（パスワード管理）
- 本番環境では `APP_DEBUG=false` に設定すること