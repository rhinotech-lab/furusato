#!/bin/bash

# 次のステップ（95-109行目）を実行するスクリプト
# WSL環境で実行してください

set -e

PROJECT_ID=${1:-""}
REGION="asia-northeast1"
SERVICE_NAME="furusato-frontend"
MYSQL_INSTANCE_NAME="app-mysql"
MYSQL_DB_NAME="app_db"
MYSQL_USER_NAME="app_user"
STORAGE_BUCKET="furusato-storage-${PROJECT_ID//-/}"

if [ -z "$PROJECT_ID" ]; then
    echo "エラー: プロジェクトIDを指定してください"
    echo "使用方法: ./scripts/execute-next-steps.sh <PROJECT_ID>"
    exit 1
fi

echo "=========================================="
echo "次のステップを実行します"
echo "プロジェクトID: $PROJECT_ID"
echo "=========================================="

gcloud config set project $PROJECT_ID

echo ""
echo "【ステップ1】Cloud SQL 接続名を取得..."
CONNECTION_NAME=$(gcloud sql instances describe $MYSQL_INSTANCE_NAME \
    --format="value(connectionName)" \
    --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$CONNECTION_NAME" ]; then
    echo "エラー: Cloud SQL インスタンス '$MYSQL_INSTANCE_NAME' が見つかりません"
    exit 1
fi

echo "接続名: $CONNECTION_NAME"

echo ""
echo "【ステップ2】Cloud Run 環境変数を設定..."
echo "MySQLパスワードを入力してください:"
read -s MYSQL_PASSWORD
echo ""

gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --set-env-vars="DB_HOST=$CONNECTION_NAME,DB_NAME=$MYSQL_DB_NAME,DB_USER=$MYSQL_USER_NAME,DB_PASSWORD=$MYSQL_PASSWORD,GCS_BUCKET=$STORAGE_BUCKET" \
    --project=$PROJECT_ID

echo ""
echo "【ステップ3】Cloud SQL 接続を追加..."
gcloud run services update $SERVICE_NAME \
    --add-cloudsql-instances=$CONNECTION_NAME \
    --region=$REGION \
    --project=$PROJECT_ID

echo ""
echo "【ステップ4】Cloud Build トリガーについて..."
echo "GitHub接続が必要です。以下のコマンドで手動で作成してください:"
echo ""
echo "gcloud builds triggers create github \\"
echo "    --name=\"furusato-deploy-trigger\" \\"
echo "    --repo-name=\"YOUR_REPO\" \\"
echo "    --repo-owner=\"YOUR_USERNAME\" \\"
echo "    --branch-pattern=\"^main$\" \\"
echo "    --build-config=\"cloudbuild.yaml\" \\"
echo "    --region=$REGION \\"
echo "    --project=$PROJECT_ID"
echo ""

echo "=========================================="
echo "完了しました！"
echo "=========================================="
