#!/bin/bash

# Cloud Run の GCS_BUCKET 環境変数を正しく設定するスクリプト

PROJECT_ID=${1:-"redhorse-prod"}
REGION="asia-northeast1"
SERVICE_NAME="furusato-frontend"
NEW_BUCKET="furusato-storage-${PROJECT_ID//-/}"

echo "=========================================="
echo "Cloud Run 環境変数を修正します"
echo "=========================================="
echo "サービス: $SERVICE_NAME"
echo "バケット名: $NEW_BUCKET"
echo ""

gcloud config set project $PROJECT_ID &>/dev/null

# 現在の環境変数を確認
echo "【現在の環境変数を確認中...】"
CURRENT_ENV=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="get(spec.template.spec.containers[0].env)" 2>/dev/null)

echo "$CURRENT_ENV" | grep -i "GCS_BUCKET" || echo "GCS_BUCKET が見つかりません"
echo ""

# 環境変数を更新
echo "【環境変数を更新中...】"
gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --update-env-vars="GCS_BUCKET=$NEW_BUCKET" \
    --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 環境変数を更新しました"
    echo ""
    echo "【更新後の確認】"
    UPDATED_ENV=$(gcloud run services describe $SERVICE_NAME \
        --region=$REGION \
        --project=$PROJECT_ID \
        --format="get(spec.template.spec.containers[0].env)" 2>/dev/null)
    
    echo "$UPDATED_ENV" | grep -i "GCS_BUCKET" || echo "確認に失敗しました"
else
    echo "❌ 環境変数の更新に失敗しました"
    exit 1
fi

echo ""
echo "=========================================="
echo "完了しました！"
echo "=========================================="
