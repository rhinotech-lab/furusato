#!/bin/bash

# 手動実行用: 各コマンドを個別に実行

PROJECT_ID=${1:-"your-project-id"}
REGION="asia-northeast1"
SERVICE_NAME="furusato-frontend"
MYSQL_INSTANCE_NAME="app-mysql"
MYSQL_DB_NAME="app_db"
MYSQL_USER_NAME="app_user"
STORAGE_BUCKET="furusato-storage-${PROJECT_ID//-/}"

echo "=========================================="
echo "手動実行コマンド集"
echo "プロジェクトID: $PROJECT_ID"
echo "=========================================="
echo ""

echo "【1. Cloud SQL 接続名を取得】"
echo "gcloud sql instances describe $MYSQL_INSTANCE_NAME \\"
echo "    --format=\"value(connectionName)\" \\"
echo "    --project=$PROJECT_ID"
echo ""

echo "【2. Cloud Run 環境変数を設定】"
echo "# まず接続名を取得してから実行:"
echo "CONNECTION_NAME=\$(gcloud sql instances describe $MYSQL_INSTANCE_NAME --format=\"value(connectionName)\" --project=$PROJECT_ID)"
echo ""
echo "gcloud run services update $SERVICE_NAME \\"
echo "    --region=$REGION \\"
echo "    --set-env-vars=\"DB_HOST=\$CONNECTION_NAME,DB_NAME=$MYSQL_DB_NAME,DB_USER=$MYSQL_USER_NAME,DB_PASSWORD=YOUR_PASSWORD,GCS_BUCKET=$STORAGE_BUCKET\" \\"
echo "    --project=$PROJECT_ID"
echo ""

echo "【3. Cloud SQL 接続を追加】"
echo "gcloud run services update $SERVICE_NAME \\"
echo "    --add-cloudsql-instances=\$CONNECTION_NAME \\"
echo "    --region=$REGION \\"
echo "    --project=$PROJECT_ID"
echo ""

echo "【4. Cloud Build トリガーを作成（GitHub接続後）】"
echo "gcloud builds triggers create github \\"
echo "    --name=\"furusato-deploy-trigger\" \\"
echo "    --repo-name=\"YOUR_REPO_NAME\" \\"
echo "    --repo-owner=\"YOUR_GITHUB_USERNAME\" \\"
echo "    --branch-pattern=\"^main$\" \\"
echo "    --build-config=\"cloudbuild.yaml\" \\"
echo "    --region=$REGION \\"
echo "    --project=$PROJECT_ID"
echo ""
