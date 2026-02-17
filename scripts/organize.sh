#!/bin/bash

# scriptsディレクトリを整理するスクリプト

cd "$(dirname "$0")/.." || exit 1

echo "=========================================="
echo "scriptsディレクトリを整理中..."
echo "=========================================="

# サブディレクトリを作成
mkdir -p scripts/{setup,deploy,verify,fix,docs}

# セットアップ関連を移動
echo "セットアップスクリプトを整理中..."
mv scripts/setup-gcp.sh scripts/setup/ 2>/dev/null || true
mv scripts/run-next-steps.sh scripts/setup/ 2>/dev/null || true

# デプロイ関連を移動
echo "デプロイスクリプトを整理中..."
mv scripts/check-deployment.sh scripts/deploy/ 2>/dev/null || true
mv scripts/watch-deployment.sh scripts/deploy/ 2>/dev/null || true

# 確認・検証を移動
echo "確認スクリプトを整理中..."
mv scripts/check-setup-status.sh scripts/verify/ 2>/dev/null || true
mv scripts/check-env-var.sh scripts/verify/ 2>/dev/null || true
mv scripts/verify-bucket-fix.sh scripts/verify/ 2>/dev/null || true

# 修正スクリプトを移動
echo "修正スクリプトを整理中..."
mv scripts/fix-storage-bucket.sh scripts/fix/ 2>/dev/null || true
mv scripts/fix-env-var.sh scripts/fix/ 2>/dev/null || true

# ドキュメントを移動
echo "ドキュメントを整理中..."
mv scripts/EXECUTE_NEXT_STEPS.md scripts/docs/ 2>/dev/null || true
mv scripts/setup-gcp-manual.md scripts/docs/ 2>/dev/null || true

# 重複・不要なファイルを削除または統合
echo "重複ファイルを整理中..."
# complete-setup.sh と execute-next-steps.sh は統合済み（run-next-steps.shで代替）
[ -f scripts/complete-setup.sh ] && rm scripts/complete-setup.sh && echo "  削除: complete-setup.sh"
[ -f scripts/execute-next-steps.sh ] && rm scripts/execute-next-steps.sh && echo "  削除: execute-next-steps.sh"
# complete-setup-manual.sh はドキュメントに統合済み
[ -f scripts/complete-setup-manual.sh ] && rm scripts/complete-setup-manual.sh && echo "  削除: complete-setup-manual.sh"
# final-status-summary.sh は check-setup-status.sh に統合
[ -f scripts/final-status-summary.sh ] && rm scripts/final-status-summary.sh && echo "  削除: final-status-summary.sh"

# パス参照を更新
echo "パス参照を更新中..."
if [ -f scripts/verify/check-setup-status.sh ]; then
    sed -i 's|./scripts/setup-gcp.sh|./scripts/setup/setup-gcp.sh|g' scripts/verify/check-setup-status.sh
    sed -i 's|./scripts/run-next-steps.sh|./scripts/setup/run-next-steps.sh|g' scripts/verify/check-setup-status.sh
    echo "✅ check-setup-status.sh のパスを更新"
fi

# ドキュメント内のパス参照を更新
if [ -d scripts/docs ]; then
    find scripts/docs -name "*.md" -type f -exec sed -i 's|scripts/setup-gcp.sh|scripts/setup/setup-gcp.sh|g' {} \;
    find scripts/docs -name "*.md" -type f -exec sed -i 's|scripts/run-next-steps.sh|scripts/setup/run-next-steps.sh|g' {} \;
    find scripts/docs -name "*.md" -type f -exec sed -i 's|scripts/check-setup-status.sh|scripts/verify/check-setup-status.sh|g' {} \;
    echo "✅ ドキュメント内のパスを更新"
fi

echo ""
echo "=========================================="
echo "整理完了！"
echo "=========================================="
echo ""
echo "新しいディレクトリ構造:"
echo "  scripts/"
echo "    setup/     - セットアップスクリプト"
echo "    deploy/    - デプロイ関連"
echo "    verify/    - 確認・検証"
echo "    fix/       - 修正・トラブルシューティング"
echo "    docs/      - ドキュメント"
echo ""
echo "使用方法:"
echo "  ./scripts/setup/setup-gcp.sh redhorse-prod"
echo "  ./scripts/setup/run-next-steps.sh"
echo "  ./scripts/verify/check-setup-status.sh redhorse-prod"
echo ""
