#!/bin/bash

# Cloud Build のデプロイをリアルタイムで監視するスクリプト

PROJECT_ID=${1:-"redhorse-prod"}

echo "=========================================="
echo "デプロイを監視中..."
echo "プロジェクトID: $PROJECT_ID"
echo "Ctrl+C で終了"
echo "=========================================="
echo ""

gcloud config set project $PROJECT_ID &>/dev/null

# 最新のビルドを取得
LATEST_BUILD=$(gcloud builds list --limit=1 --format="value(id)" --project=$PROJECT_ID 2>/dev/null)

if [ -n "$LATEST_BUILD" ]; then
    echo "最新のビルドID: $LATEST_BUILD"
    echo "ログをストリーミング中..."
    echo ""
    gcloud builds log $LATEST_BUILD --stream --project=$PROJECT_ID
else
    echo "ビルドが見つかりません。新しいビルドを待機中..."
    echo ""
    gcloud builds log --stream --project=$PROJECT_ID
fi
