# 本番環境構築ドキュメント（GCP Cloud Run）

本ドキュメントは、GitHub を起点に Cloud Build でビルドし、Cloud Run へ自動デプロイする本番環境の構築手順をまとめたものです。  
ストレージは Cloud Storage、DB は MySQL（Cloud SQL）を使用します。

## 全体構成

| 項目 | サービス |
|---|---|
| ソース管理 | GitHub |
| CI/CD | Cloud Build（GitHub 連携トリガー） |
| 実行環境 | Cloud Run |
| DB | Cloud SQL for MySQL 8.0 |
| ストレージ | Cloud Storage |
| 認証 | Laravel Sanctum |

## アプリケーション構成

| コンポーネント | 技術 | 説明 |
|---|---|---|
| フロントエンド | React 19 + Vite 6 | SPA（静的ビルド） |
| バックエンド | Laravel 12 (PHP 8.3) | REST API |
| データベース | MySQL 8.0 | Cloud SQL |
| Webサーバー | Nginx | リバースプロキシ |

## 前提
- GCP プロジェクトが作成済み
- gcloud CLI が利用可能
- GitHub リポジトリが作成済み

## 1. 必要な API を有効化
以下の API を有効化します。
- Cloud Run API
- Cloud Build API
- Artifact Registry API
- Cloud SQL Admin API
- Cloud Storage

## 2. Artifact Registry（コンテナ）を作成
Cloud Build で作成したイメージを保存するリポジトリを作成します。
- リポジトリ名例: `app-images`
- リージョン例: `asia-northeast1`

## 3. Cloud SQL（MySQL）を作成
MySQL インスタンスを作成し、アプリ用の DB とユーザーを準備します。
- バージョン: MySQL 8.0
- インスタンス名例: `app-mysql`
- DB 名例: `app_db`
- ユーザー名例: `app_user`

## 4. Cloud Storage バケットを作成
アプリで利用するストレージ用バケットを作成します。
- バケット名例: `furusato-storage-<project-id>` (プロジェクトIDを含む一意な名前)
- リージョン例: `asia-northeast1`

## 5. Cloud Run サービスを作成
Cloud Run のサービスを作成します（後で Cloud Build からデプロイ）。
以下の設定を想定します。
- リージョン: `asia-northeast1`
- 認証: 公開（必要に応じて制限）
- コンテナポート: `80`

## 6. 環境変数の設定
Cloud Run に以下の環境変数を設定します。

| 環境変数 | 説明 |
|---|---|
| `APP_KEY` | Laravelアプリケーションキー |
| `APP_ENV` | `production` |
| `DB_HOST` | Cloud SQL 接続名 |
| `DB_NAME` | データベース名 |
| `DB_USER` | データベースユーザー |
| `DB_PASSWORD` | データベースパスワード |
| `GCS_BUCKET` | Cloud Storage バケット名 |

※ Cloud SQL への接続は「Cloud SQL 接続」からインスタンスを紐付けます。

## 7. GitHub と Cloud Build の連携
GitHub の `main` ブランチへの push で自動ビルド・デプロイされるように設定します。

1. Cloud Build トリガーを作成
   - ソース: GitHub
   - リポジトリ: 本プロジェクトの GitHub リポジトリ
   - ブランチ: `^main$`
   - ビルド構成: `cloudbuild.yaml` を使用

2. `cloudbuild.yaml` を用意し、以下を実行するようにします。
   - コンテナイメージのビルド
   - Artifact Registry へ push
   - Cloud Run へデプロイ

## 8. リリースフロー
1. GitHub の `main` に push
2. Cloud Build が自動的に起動
3. イメージ作成 → Cloud Run へデプロイ

## 運用上の注意
- 環境変数に秘密情報を置く場合は Secret Manager を推奨
- Cloud SQL への接続は Cloud Run からのプライベート接続を推奨
- バケットの権限は最小権限を適用
- 本番環境では `APP_DEBUG=false` に設定すること
