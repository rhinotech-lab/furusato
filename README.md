# ふるさと納税制作管理システム

ふるさと納税のバナー制作を効率的に管理するためのWebアプリケーションです。自治体、事業者、管理者が協力して、バナー制作の全工程を一元管理できます。

## システム概要

本システムは、ふるさと納税のバナー制作プロセスをデジタル化し、以下の課題を解決します：

- **制作工程の可視化**: バナー制作の進捗状況をリアルタイムで把握
- **承認フローの効率化**: 画像のアップロードから承認まで、スムーズなワークフローを実現
- **改修管理の一元化**: 修正依頼から完了まで、すべての履歴を追跡可能
- **品質管理の標準化**: チェックリストやガイドラインに基づいた品質管理
- **報告業務の自動化**: 月次報告書を自動生成し、業務負担を軽減

## 主な機能

### 案件管理
- バナー画像の一括アップロード（CSV連携対応）
- 案件ごとの進捗状況管理
- ステータス管理（制作中、承認待ち、承認済みなど）
- 納期管理とアラート機能

### 画像改修管理
- 改修依頼の作成と追跡
- バージョン管理（修正前後の比較表示）
- 改修履歴の完全な記録

### 素材回収
- 使用済み素材の回収状況管理
- 素材の整理と分類

### プロジェクト管理
- プロジェクト単位での案件管理
- プロジェクトごとの進捗集計

### トレンド分析
- 自治体別のトレンド分析
- 成功事例のカタログ化
- デザインパターンの分析

### デザインカタログ
- 自治体ごとの好みのデザインパターン集
- 勝てるデザインのレシピ集

### 月次報告書生成
- 月別の制作成果を自動抽出
- 修正前後の比較付き報告書を自動生成
- PDF出力対応

### モバイルプレビュー
- スマートフォンでの表示確認
- 視認性ガイドラインの表示

### 通知・アラート
- 承認依頼の通知
- 納期迫りのアラート
- システム全体の通知管理

### ユーザー・組織管理
- 自治体情報の管理
- 事業者情報の管理
- ユーザー権限管理（管理者、自治体ユーザー、事業者ユーザー）

## ユーザー役割

- **管理者（Super Admin）**: システム全体の管理、ユーザー管理、組織管理
- **自治体ユーザー（Municipality User）**: バナーの承認、改修依頼、進捗確認
- **事業者ユーザー（Business User）**: バナーの制作、アップロード、改修対応

このリポジトリには、アプリをローカルで実行するために必要なものがすべて含まれています。

## 技術スタック

- **バックエンド**: Laravel 12 (PHP 8.3+)
- **フロントエンド**: React 19
- **データベース**: MySQL 8.0
- **認証**: Laravel Sanctum

## 前提条件

- Docker & Docker Compose
- Node.js 20以上（ローカル開発の場合）
- Composer（ローカル開発の場合）

## セットアップ

### Docker Composeを使用したセットアップ（推奨）

1. リポジトリをクローン:
   ```bash
   git clone <repository-url>
   cd ふるさと納税-制作管理システム
   ```

2. 環境変数を設定:
   ```bash
   cp backend/.env.example backend/.env
   ```
   `backend/.env` ファイルを編集して、必要に応じて設定を変更してください。

3. Docker Composeで起動:
   ```bash
   docker compose up --build
   ```

4. Laravelのセットアップ:
   ```bash
   # コンテナに入る
   docker compose exec backend bash
   
   # アプリケーションキーを生成
   php artisan key:generate
   
   # データベースマイグレーション
   php artisan migrate
   
   # シーダーを実行（サンプルユーザーを作成）
   php artisan db:seed
   ```

5. アプリケーションにアクセス:
   - フロントエンド: http://localhost:3000
   - バックエンドAPI: http://localhost:8080/api
   - MySQL: localhost:3306

## ローカル開発

### バックエンド（Laravel）

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### フロントエンド（React）

```bash
npm install
npm run dev
```

## デフォルトユーザー

シーダー実行後、以下のユーザーが作成されます:

- **管理者**: admin@example.com / password
- **自治体ユーザー**: municipality@example.com / password
- **事業者ユーザー**: business@example.com / password

## APIエンドポイント

### 認証

- `POST /api/login` - ログイン
- `POST /api/logout` - ログアウト
- `GET /api/me` - 現在のユーザー情報取得

### ユーザー管理（管理者のみ）

- `GET /api/users` - ユーザー一覧
- `GET /api/users/{id}` - ユーザー詳細
- `POST /api/users` - ユーザー作成
- `PUT /api/users/{id}` - ユーザー更新
- `DELETE /api/users/{id}` - ユーザー削除

## 開発ガイド

詳細な開発ガイドについては、[DEVELOPMENT.md](./DEVELOPMENT.md) を参照してください。

## 本番環境デプロイ

本番環境へのデプロイ手順については、[doc/PRODUCTION.md](./doc/PRODUCTION.md) を参照してください。

### セットアップスクリプト

GCP本番環境のセットアップには、`scripts/` ディレクトリ内のスクリプトを使用します：

```bash
# 基本リソース作成
./scripts/setup/setup-gcp.sh redhorse-prod

# 環境変数・接続設定
./scripts/setup/run-next-steps.sh

# セットアップ状況確認
./scripts/verify/check-setup-status.sh redhorse-prod
```

詳細は [scripts/README.md](./scripts/README.md) を参照してください。
