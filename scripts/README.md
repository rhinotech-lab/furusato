# Scripts ディレクトリ

GCP本番環境のセットアップ・管理用スクリプト集

## ディレクトリ構造

```
scripts/
├── setup/          # セットアップ関連
├── deploy/         # デプロイ関連
├── verify/         # 確認・検証
├── fix/            # 修正・トラブルシューティング
└── docs/           # ドキュメント
```

## セットアップスクリプト

### 基本セットアップ
- `setup/setup-gcp.sh` - GCPリソースの基本セットアップ（手順1-5）
- `setup/run-next-steps.sh` - 環境変数・Cloud SQL接続設定（手順6）

### デプロイ関連
- `deploy/check-deployment.sh` - デプロイ状況の確認
- `deploy/watch-deployment.sh` - デプロイログのリアルタイム監視

### 確認・検証
- `verify/check-setup-status.sh` - セットアップ完了状況の確認
- `verify/check-env-var.sh` - 環境変数の確認
- `verify/verify-bucket-fix.sh` - バケット名変更の確認

### 修正・トラブルシューティング
- `fix/fix-storage-bucket.sh` - Cloud Storageバケット名の競合解決
- `fix/fix-env-var.sh` - 環境変数の修正

### ドキュメント
- `docs/EXECUTE_NEXT_STEPS.md` - 手動実行手順
- `docs/setup-gcp-manual.md` - セットアップ手動実行手順

## 使用方法

### 初回セットアップ
```bash
# 1. 基本リソース作成
./scripts/setup/setup-gcp.sh redhorse-prod

# 2. 環境変数・接続設定
./scripts/setup/run-next-steps.sh
```

### デプロイ確認
```bash
# デプロイ状況確認
./scripts/deploy/check-deployment.sh redhorse-prod

# リアルタイム監視
./scripts/deploy/watch-deployment.sh redhorse-prod
```

### セットアップ状況確認
```bash
./scripts/verify/check-setup-status.sh redhorse-prod
```

## 注意事項

- すべてのスクリプトはWSL環境で実行してください
- プロジェクトIDは `redhorse-prod` がデフォルトです
- 実行前に `gcloud auth login` で認証してください
