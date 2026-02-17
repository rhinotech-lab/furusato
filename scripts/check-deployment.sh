#!/bin/bash

# Cloud Build のデプロイ状況を確認するスクリプト

PROJECT_ID=${1:-"redhorse-prod"}
SERVICE_NAME="furusato-frontend"
REGION="asia-northeast1"

echo "=========================================="
echo "デプロイ状況を確認中..."
echo "プロジェクトID: $PROJECT_ID"
echo "=========================================="
echo ""

gcloud config set project $PROJECT_ID &>/dev/null

echo "【1】最新のCloud Build実行状況】
echo "----------------------------------------"
LATEST_BUILD=$(gcloud builds list --limit=1 --format="value(id)" --project=$PROJECT_ID 2>/dev/null)

if [ -n "$LATEST_BUILD" ]; then
    echo "最新のビルドID: $LATEST_BUILD"
    echo ""
    gcloud builds describe $LATEST_BUILD --project=$PROJECT_ID --format="table(id,status,createTime,logUrl)" 2>/dev/null
    echo ""
    echo "詳細を確認:"
    echo "  gcloud builds log $LATEST_BUILD --project=$PROJECT_ID"
else
    echo "⚠️  ビルド履歴が見つかりません"
fi
echo ""

echo "【2】Cloud Run サービスの最新リビジョン】
echo "----------------------------------------"
LATEST_REVISION=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="value(status.latestReadyRevisionName)" 2>/dev/null)

if [ -n "$LATEST_REVISION" ]; then
    echo "最新リビジョン: $LATEST_REVISION"
    
    REVISION_INFO=$(gcloud run revisions describe $LATEST_REVISION \
        --region=$REGION \
        --project=$PROJECT_ID \
        --format="table(metadata.creationTimestamp,status.conditions[0].status,status.conditions[0].reason)" 2>/dev/null)
    
    if [ -n "$REVISION_INFO" ]; then
        echo "$REVISION_INFO"
    fi
else
    echo "⚠️  リビジョン情報を取得できませんでした"
fi
echo ""

echo "【3】サービスURL】
echo "----------------------------------------"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="value(status.url)" 2>/dev/null)

if [ -n "$SERVICE_URL" ]; then
    echo "✅ サービスURL: $SERVICE_URL"
    echo ""
    echo "アクセステスト:"
    echo "  curl -I $SERVICE_URL"
else
    echo "⚠️  サービスURLを取得できませんでした"
fi
echo ""

echo "=========================================="
echo "確認完了"
echo "=========================================="
echo ""
echo "【リアルタイムでログを確認する場合】"
echo "  gcloud builds log --stream --project=$PROJECT_ID"
echo ""
