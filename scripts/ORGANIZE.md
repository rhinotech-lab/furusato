# ファイル整理ガイド

## 整理方針

### scriptsディレクトリの整理

以下のサブディレクトリに分類します：

1. **setup/** - セットアップ関連
   - `setup-gcp.sh` - 基本リソース作成
   - `run-next-steps.sh` - 環境変数・接続設定

2. **deploy/** - デプロイ関連
   - `check-deployment.sh` - デプロイ状況確認
   - `watch-deployment.sh` - デプロイログ監視

3. **verify/** - 確認・検証
   - `check-setup-status.sh` - セットアップ状況確認
   - `check-env-var.sh` - 環境変数確認
   - `verify-bucket-fix.sh` - バケット確認

4. **fix/** - 修正・トラブルシューティング
   - `fix-storage-bucket.sh` - バケット名修正
   - `fix-env-var.sh` - 環境変数修正

5. **docs/** - ドキュメント
   - `EXECUTE_NEXT_STEPS.md` - 手動実行手順
   - `setup-gcp-manual.md` - セットアップ手順

### 削除・統合するファイル

- `complete-setup.sh` → `run-next-steps.sh` に統合
- `execute-next-steps.sh` → `run-next-steps.sh` に統合
- `complete-setup-manual.sh` → `docs/setup-gcp-manual.md` に統合
- `final-status-summary.sh` → `check-setup-status.sh` に統合

## 実行方法

```bash
# 整理スクリプトを実行
chmod +x scripts/organize.sh
./scripts/organize.sh
```

## 整理後の使用方法

```bash
# セットアップ
./scripts/setup/setup-gcp.sh redhorse-prod
./scripts/setup/run-next-steps.sh

# 確認
./scripts/verify/check-setup-status.sh redhorse-prod

# デプロイ確認
./scripts/deploy/check-deployment.sh redhorse-prod
```
