#!/bin/bash
# 次のステップを実行するスクリプト

PROJECT_ID="redhorse-prod"  # cloudbuild.yamlから推測
REGION="asia-northeast1"
SERVICE_NAME="furusato-frontend"
MYSQL_INSTANCE_NAME="app-mysql"
MYSQL_DB_NAME="app_db"
MYSQL_USER_NAME="app_user"
STORAGE_BUCKET="furusato-storage-${PROJECT_ID//-/}"

echo "プロジェクトID: $PROJECT_ID で実行します"
echo "異なる場合は、スクリプト内の PROJECT_ID を変更してください"
echo ""

# プロジェクトを設定
gcloud config set project $PROJECT_ID

# Cloud SQL 接続名を取得
echo "【1】Cloud SQL 接続名を取得中..."
CONNECTION_NAME=$(gcloud sql instances describe $MYSQL_INSTANCE_NAME \
    --format="value(connectionName)" \
    --project=$PROJECT_ID 2>&1)

if echo "$CONNECTION_NAME" | grep -q "ERROR"; then
    echo "エラー: $CONNECTION_NAME"
    echo "先に setup-gcp.sh を実行してCloud SQLインスタンスを作成してください"
    exit 1
fi

echo "接続名: $CONNECTION_NAME"
echo ""

# 環境変数設定（パスワードは手動入力が必要）
echo "【2】Cloud Run 環境変数を設定します"
echo "MySQLパスワードを入力してください（setup-gcp.shで生成されたもの）:"
read -s MYSQL_PASSWORD
echo ""

gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --set-env-vars="DB_HOST=$CONNECTION_NAME,DB_NAME=$MYSQL_DB_NAME,DB_USER=$MYSQL_USER_NAME,DB_PASSWORD=$MYSQL_PASSWORD,GCS_BUCKET=$STORAGE_BUCKET" \
    --project=$PROJECT_ID

echo ""
echo "【3】Cloud SQL 接続を追加中..."
gcloud run services update $SERVICE_NAME \
    --add-cloudsql-instances=$CONNECTION_NAME \
    --region=$REGION \
    --project=$PROJECT_ID

echo ""
echo "【4】Cloud Build トリガーについて"
echo "GitHub接続が必要です。以下のコマンドを実行してください:"
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

echo "完了しました！"
