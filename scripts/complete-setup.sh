#!/bin/bash

# Cloud Build トリガー作成、環境変数設定、Cloud SQL接続のセットアップ
# 使用方法: ./scripts/complete-setup.sh <PROJECT_ID>

set -e

PROJECT_ID=${1:-""}
REGION="asia-northeast1"
SERVICE_NAME="furusato-frontend"
MYSQL_INSTANCE_NAME="app-mysql"
MYSQL_DB_NAME="app_db"
MYSQL_USER_NAME="app_user"
STORAGE_BUCKET="furusato-storage-${PROJECT_ID//-/}"
GITHUB_OWNER=${2:-""}
GITHUB_REPO=${3:-""}

if [ -z "$PROJECT_ID" ]; then
    echo "エラー: プロジェクトIDを指定してください"
    echo "使用方法: ./scripts/complete-setup.sh <PROJECT_ID> [GITHUB_OWNER] [GITHUB_REPO]"
    exit 1
fi

echo "=========================================="
echo "GCP セットアップ完了手順を実行します"
echo "プロジェクトID: $PROJECT_ID"
echo "=========================================="

# プロジェクトを設定
gcloud config set project $PROJECT_ID

echo ""
echo "=========================================="
echo "1. Cloud Build トリガーを作成中..."
echo "=========================================="

if [ -n "$GITHUB_OWNER" ] && [ -n "$GITHUB_REPO" ]; then
    # GitHub接続が既にあるか確認
    CONNECTIONS=$(gcloud builds connections list --region=$REGION --project=$PROJECT_ID --format="value(name)" 2>/dev/null || echo "")
    
    if [ -z "$CONNECTIONS" ]; then
        echo "GitHub接続を作成する必要があります。"
        echo "以下のコマンドを実行してGitHub接続を作成してください:"
        echo "  gcloud builds connections create github \\"
        echo "    --region=$REGION \\"
        echo "    --project=$PROJECT_ID"
        echo ""
        echo "その後、GitHub認証を完了してください:"
        echo "  gcloud builds connections create github \\"
        echo "    --region=$REGION \\"
        echo "    --project=$PROJECT_ID"
        echo ""
        read -p "GitHub接続が完了しましたか？ (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "GitHub接続を先に完了してください。"
            exit 1
        fi
    fi
    
    # トリガーを作成
    echo "Cloud Build トリガーを作成中..."
    gcloud builds triggers create github \
        --name="furusato-deploy-trigger" \
        --repo-name="$GITHUB_REPO" \
        --repo-owner="$GITHUB_OWNER" \
        --branch-pattern="^main$" \
        --build-config="cloudbuild.yaml" \
        --region=$REGION \
        --project=$PROJECT_ID || echo "トリガーは既に存在するか、作成に失敗しました"
else
    echo "GitHub情報が指定されていません。"
    echo "手動でCloud Buildトリガーを作成してください:"
    echo "  gcloud builds triggers create github \\"
    echo "    --name=\"furusato-deploy-trigger\" \\"
    echo "    --repo-name=\"YOUR_REPO\" \\"
    echo "    --repo-owner=\"YOUR_USERNAME\" \\"
    echo "    --branch-pattern=\"^main$\" \\"
    echo "    --build-config=\"cloudbuild.yaml\" \\"
    echo "    --region=$REGION \\"
    echo "    --project=$PROJECT_ID"
fi

echo ""
echo "=========================================="
echo "2. Cloud SQL 接続情報を取得中..."
echo "=========================================="

# Cloud SQL インスタンスの接続名を取得
CONNECTION_NAME=$(gcloud sql instances describe $MYSQL_INSTANCE_NAME \
    --format="value(connectionName)" \
    --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$CONNECTION_NAME" ]; then
    echo "警告: Cloud SQL インスタンス '$MYSQL_INSTANCE_NAME' が見つかりません。"
    echo "先に setup-gcp.sh を実行してください。"
    exit 1
fi

echo "接続名: $CONNECTION_NAME"

echo ""
echo "=========================================="
echo "3. Cloud Run 環境変数を設定中..."
echo "=========================================="

# MySQLパスワードを取得（Secret Managerを使用する場合は変更が必要）
echo "MySQLパスワードを入力してください（Secret Managerを使用する場合はスキップ）:"
read -s MYSQL_PASSWORD
echo ""

# 環境変数を設定
echo "環境変数を設定中..."
gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --set-env-vars="DB_HOST=$CONNECTION_NAME,DB_NAME=$MYSQL_DB_NAME,DB_USER=$MYSQL_USER_NAME,DB_PASSWORD=$MYSQL_PASSWORD,GCS_BUCKET=$STORAGE_BUCKET" \
    --project=$PROJECT_ID || echo "環境変数の設定に失敗しました"

echo ""
echo "=========================================="
echo "4. Cloud SQL 接続を追加中..."
echo "=========================================="

# Cloud SQL 接続を追加
gcloud run services update $SERVICE_NAME \
    --add-cloudsql-instances=$CONNECTION_NAME \
    --region=$REGION \
    --project=$PROJECT_ID || echo "Cloud SQL接続の追加に失敗しました（既に追加されている可能性があります）"

echo ""
echo "=========================================="
echo "セットアップが完了しました！"
echo "=========================================="
echo ""
echo "次のステップ:"
echo "1. GitHub の main ブランチに push して、自動デプロイをテストしてください"
echo "2. Cloud Run サービスのURLを確認:"
echo "   gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format='value(status.url)'"
echo "3. 必要に応じて Secret Manager を使用してパスワードを管理してください"
echo ""
