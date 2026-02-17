# クイックスタートガイド

## ファイル整理の実行

```bash
# 整理スクリプトを実行
chmod +x scripts/organize.sh
./scripts/organize.sh
```

## 整理後の使用方法

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
