# ファイル整理ガイド

## 整理内容

### 1. scriptsディレクトリの整理

以下のサブディレクトリに分類：

- `scripts/setup/` - セットアップ関連スクリプト
- `scripts/deploy/` - デプロイ関連スクリプト
- `scripts/verify/` - 確認・検証スクリプト
- `scripts/fix/` - 修正・トラブルシューティング
- `scripts/docs/` - ドキュメント

### 2. 重複ファイルの統合

以下のファイルを統合・削除：

- `complete-setup.sh` → `run-next-steps.sh` に統合
- `execute-next-steps.sh` → `run-next-steps.sh` に統合
- `complete-setup-manual.sh` → ドキュメントに統合
- `final-status-summary.sh` → `check-setup-status.sh` に統合

### 3. .gitignore の更新

WindowsのZone.Identifierファイルを無視するように設定

## 実行方法

```bash
# 整理スクリプトを実行
chmod +x scripts/organize.sh
./scripts/organize.sh
```

## 整理後のディレクトリ構造

```
scripts/
├── setup/
│   ├── setup-gcp.sh
│   └── run-next-steps.sh
├── deploy/
│   ├── check-deployment.sh
│   └── watch-deployment.sh
├── verify/
│   ├── check-setup-status.sh
│   ├── check-env-var.sh
│   └── verify-bucket-fix.sh
├── fix/
│   ├── fix-storage-bucket.sh
│   └── fix-env-var.sh
├── docs/
│   ├── EXECUTE_NEXT_STEPS.md
│   └── setup-gcp-manual.md
├── README.md
└── ORGANIZE.md
```
