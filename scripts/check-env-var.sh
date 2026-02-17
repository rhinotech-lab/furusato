#!/bin/bash

# Cloud Run の環境変数を確認する簡単なスクリプト

PROJECT_ID=${1:-"redhorse-prod"}
REGION="asia-northeast1"
SERVICE_NAME="furusato-frontend"

echo "Cloud Run サービスの環境変数を確認中..."
echo ""

gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="table(spec.template.spec.containers[0].env[].name,spec.template.spec.containers[0].env[].value)" 2>/dev/null

echo ""
echo "GCS_BUCKET のみを確認:"
gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="value(spec.template.spec.containers[0].env)" 2>/dev/null | grep -i "GCS_BUCKET" || echo "GCS_BUCKET が見つかりません"
