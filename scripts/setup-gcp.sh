#!/bin/bash

# GCP 本番環境セットアップスクリプト
# 使用方法: ./scripts/setup-gcp.sh <PROJECT_ID>

set -e

PROJECT_ID=${1:-""}
REGION="asia-northeast1"
REPOSITORY_NAME="app-images"
SERVICE_NAME="furusato-frontend"
MYSQL_INSTANCE_NAME="app-mysql"
MYSQL_DB_NAME="app_db"
MYSQL_USER_NAME="app_user"
STORAGE_BUCKET="furusato-storage-${PROJECT_ID//-/}"

if [ -z "$PROJECT_ID" ]; then
    echo "エラー: プロジェクトIDを指定してください"
    echo "使用方法: ./scripts/setup-gcp.sh <PROJECT_ID>"
    exit 1
fi

echo "=========================================="
echo "GCP 本番環境セットアップを開始します"
echo "プロジェクトID: $PROJECT_ID"
echo "=========================================="

# プロジェクトを設定
gcloud config set project $PROJECT_ID

echo ""
echo "1. 必要な API を有効化中..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    sqladmin.googleapis.com \
    storage-component.googleapis.com \
    --project=$PROJECT_ID

echo ""
echo "2. Artifact Registry リポジトリを作成中..."
gcloud artifacts repositories create $REPOSITORY_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Application container images" \
    --project=$PROJECT_ID || echo "リポジトリは既に存在します"

echo ""
echo "3. Cloud SQL (MySQL) インスタンスを作成中..."
echo "注意: この処理には数分かかります..."

# インスタンスが存在するか確認
if ! gcloud sql instances describe $MYSQL_INSTANCE_NAME --project=$PROJECT_ID &>/dev/null; then
    gcloud sql instances create $MYSQL_INSTANCE_NAME \
        --database-version=MYSQL_8_0 \
        --tier=db-f1-micro \
        --region=$REGION \
        --root-password=$(openssl rand -base64 32) \
        --project=$PROJECT_ID
    
    echo "データベースを作成中..."
    gcloud sql databases create $MYSQL_DB_NAME \
        --instance=$MYSQL_INSTANCE_NAME \
        --project=$PROJECT_ID || echo "データベースは既に存在します"
    
    echo "ユーザーを作成中..."
    MYSQL_PASSWORD=$(openssl rand -base64 32)
    gcloud sql users create $MYSQL_USER_NAME \
        --instance=$MYSQL_INSTANCE_NAME \
        --password=$MYSQL_PASSWORD \
        --project=$PROJECT_ID || echo "ユーザーは既に存在します"
    
    echo "MySQL パスワード: $MYSQL_PASSWORD"
    echo "このパスワードを安全に保管してください！"
else
    echo "MySQL インスタンスは既に存在します"
fi

echo ""
echo "4. Cloud Storage バケットを作成中..."
gsutil mb -p $PROJECT_ID -l $REGION gs://$STORAGE_BUCKET/ || echo "バケットは既に存在します"

echo ""
echo "5. Cloud Run サービスを作成中（初回デプロイ用）..."
# サービスが存在しない場合のみ作成
if ! gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID &>/dev/null; then
    # ダミーイメージでサービスを作成（後でCloud Buildから更新）
    gcloud run deploy $SERVICE_NAME \
        --image=gcr.io/cloudrun/hello \
        --region=$REGION \
        --platform=managed \
        --allow-unauthenticated \
        --port=8080 \
        --project=$PROJECT_ID || echo "サービスの作成に失敗しました（既に存在する可能性があります）"
else
    echo "サービスは既に存在します"
fi

echo ""
echo "=========================================="
echo "セットアップが完了しました！"
echo "=========================================="
echo ""
echo "次のステップ:"
echo "1. Cloud Build トリガーを手動で作成してください"
echo "   - ソース: GitHub"
echo "   - リポジトリ: あなたのGitHubリポジトリ"
echo "   - ブランチ: ^main$"
echo "   - ビルド構成: cloudbuild.yaml"
echo ""
echo "2. Cloud Run の環境変数を設定してください:"
echo "   - DB_HOST: Cloud SQL インスタンスの接続名"
echo "   - DB_NAME: $MYSQL_DB_NAME"
echo "   - DB_USER: $MYSQL_USER_NAME"
echo "   - DB_PASSWORD: (上記で生成されたパスワード)"
echo "   - GCS_BUCKET: $STORAGE_BUCKET"
echo ""
echo "3. Cloud SQL 接続を Cloud Run サービスに紐付けてください"
echo ""
