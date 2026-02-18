# ふるさと納税制作管理システム

ふるさと納税のバナー制作を効率的に管理するためのWebアプリケーションです。自治体、事業者、制作者、管理者が協力して、バナー制作の全工程を一元管理できます。

## システム概要

本システムは、ふるさと納税のバナー制作プロセスをデジタル化し、以下の課題を解決します：

- **制作工程の可視化**: バナー制作の進捗状況をリアルタイムで把握
- **承認フローの効率化**: 画像のアップロードから承認まで、スムーズなワークフローを実現
- **改修管理の一元化**: 修正依頼から完了まで、すべての履歴を追跡可能
- **品質管理の標準化**: チェックリストやガイドラインに基づいた品質管理

## 主な機能

### ホーム（ダッシュボード）
- 要対応・承認待ち・承認済み・全案件数のサマリー表示
- 最新の更新状況一覧（事業者名・期限・更新日付き）
- 各案件への直接リンク

### 案件一覧
- バナー画像の一括アップロード（CSV連携対応）
- 案件ごとの進捗状況管理
- ステータス管理（制作中、承認待ち、承認済みなど）
- 外部URL・保存ボタンなど操作列の統合表示
- 納期管理とアラート機能

### 画像改修管理
- 改修依頼の作成と追跡
- バージョン管理（修正前後の比較表示）
- 改修履歴の完全な記録

### 素材回収状況
- 使用済み素材の回収状況管理
- 素材の整理と分類

### 月次報告書生成
- 月別の制作成果を自動抽出
- 修正前後の比較付き報告書を自動生成

### モバイルプレビュー
- スマートフォンでの表示確認
- 視認性ガイドラインの表示

### 通知・アラート
- 承認依頼の通知
- 納期迫りのアラート
- システム全体の通知管理

### ユーザー・組織管理
- 自治体情報の管理（自治体一覧）
- 事業者情報の管理（事業者一覧 / 編集 / 削除）
- 商品情報の管理（商品一覧）
- ユーザー権限管理
- アカウント設定

## ユーザー役割

- **システム管理者（Super Admin）**: システム全体の管理、ユーザー管理、組織管理
- **制作者（Creator）**: 画像のアップロード、制作、チャット
- **自治体ユーザー（Municipality User）**: バナーの承認、改修依頼、進捗確認
- **事業者ユーザー（Business User）**: バナーの承認（自分の商品のみ）

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite 6
- **バックエンド**: Laravel 12 (PHP 8.3+)
- **データベース**: MySQL 8.0
- **認証**: Laravel Sanctum
- **UIフレームワーク**: Tailwind CSS
- **アイコン**: Lucide React
- **ルーティング**: React Router v7

## 前提条件

- Docker & Docker Compose
- Node.js 20以上（フロントエンド開発）
- Composer（バックエンド開発）

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
   docker compose up --build -d
   ```

4. Laravelのセットアップ:
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

5. フロントエンドを起動:
   ```bash
   npm install
   npm run dev
   ```

6. アプリケーションにアクセス:
   - フロントエンド: http://localhost:3000
   - バックエンドAPI: http://localhost:8080/api
   - MySQL: localhost:3306

## デフォルトユーザー

シーダー実行後、以下のユーザーが作成されます:

| ロール | メールアドレス | パスワード |
|---|---|---|
| 管理者 | admin@example.com | password |
| 制作者 | creator@example.com | password |
| 自治体ユーザー | municipality@example.com | password |
| 事業者ユーザー | business@example.com | password |

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

## ページ一覧

| ページ名 | パス | 説明 |
|---|---|---|
| ホーム | `/admin` | ダッシュボード |
| 通知履歴 | `/admin/notifications` | 通知一覧 |
| 要対応案件 | `/admin/alerts` | アラート一覧 |
| 自治体一覧 | `/admin/municipalities` | 自治体管理 |
| 事業者一覧 | `/admin/businesses` | 事業者管理 |
| 商品一覧 | `/admin/products` | 商品管理 |
| 案件一覧 | `/admin/images` | 案件管理 |
| 画像改修状況 | `/admin/revisions` | 改修一覧 |
| 画像詳細 | `/admin/revisions/:id` | 画像詳細・チャット |
| 新規画像登録 | `/admin/images/new` | 画像アップロード |
| 設定 | `/admin/users` | アカウント設定 |

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
