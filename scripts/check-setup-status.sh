#!/bin/bash

# GCP セットアップ完了状況を確認するスクリプト

PROJECT_ID=${1:-"redhorse-prod"}
REGION="asia-northeast1"
REPOSITORY_NAME="app-images"
SERVICE_NAME="furusato-frontend"
MYSQL_INSTANCE_NAME="app-mysql"
MYSQL_DB_NAME="app_db"
MYSQL_USER_NAME="app_user"
STORAGE_BUCKET="furusato-storage-${PROJECT_ID//-/}"

echo "=========================================="
echo "GCP セットアップ完了状況チェック"
echo "プロジェクトID: $PROJECT_ID"
echo "=========================================="
echo ""

gcloud config set project $PROJECT_ID 2>/dev/null || {
    echo "エラー: プロジェクト '$PROJECT_ID' が見つかりません"
    exit 1
}

# チェック結果
ALL_COMPLETE=true

echo "【1】必要な API の有効化状況"
echo "----------------------------------------"
APIS=(
    "run.googleapis.com:Cloud Run API"
    "cloudbuild.googleapis.com:Cloud Build API"
    "artifactregistry.googleapis.com:Artifact Registry API"
    "sqladmin.googleapis.com:Cloud SQL Admin API"
    "storage-component.googleapis.com:Cloud Storage API"
)

for api_info in "${APIS[@]}"; do
    IFS=':' read -r api name <<< "$api_info"
    if gcloud services list --enabled --filter="name:$api" --project=$PROJECT_ID --format="value(name)" | grep -q "$api"; then
        echo "✅ $name: 有効"
    else
        echo "❌ $name: 無効"
        ALL_COMPLETE=false
    fi
done
echo ""

echo "【2】Artifact Registry リポジトリ"
echo "----------------------------------------"
if gcloud artifacts repositories describe $REPOSITORY_NAME --location=$REGION --project=$PROJECT_ID &>/dev/null; then
    echo "✅ リポジトリ '$REPOSITORY_NAME' が存在します"
else
    echo "❌ リポジトリ '$REPOSITORY_NAME' が見つかりません"
    ALL_COMPLETE=false
fi
echo ""

echo "【3】Cloud SQL (MySQL) インスタンス"
echo "----------------------------------------"
if gcloud sql instances describe $MYSQL_INSTANCE_NAME --project=$PROJECT_ID &>/dev/null; then
    echo "✅ インスタンス '$MYSQL_INSTANCE_NAME' が存在します"
    
    # データベース確認
    if gcloud sql databases describe $MYSQL_DB_NAME --instance=$MYSQL_INSTANCE_NAME --project=$PROJECT_ID &>/dev/null; then
        echo "✅ データベース '$MYSQL_DB_NAME' が存在します"
    else
        echo "❌ データベース '$MYSQL_DB_NAME' が見つかりません"
        ALL_COMPLETE=false
    fi
    
    # ユーザー確認
    if gcloud sql users list --instance=$MYSQL_INSTANCE_NAME --project=$PROJECT_ID --format="value(name)" | grep -q "^$MYSQL_USER_NAME$"; then
        echo "✅ ユーザー '$MYSQL_USER_NAME' が存在します"
    else
        echo "❌ ユーザー '$MYSQL_USER_NAME' が見つかりません"
        ALL_COMPLETE=false
    fi
else
    echo "❌ インスタンス '$MYSQL_INSTANCE_NAME' が見つかりません"
    ALL_COMPLETE=false
fi
echo ""

echo "【4】Cloud Storage バケット"
echo "----------------------------------------"
if gsutil ls -b gs://$STORAGE_BUCKET/ &>/dev/null 2>&1; then
    echo "✅ バケット '$STORAGE_BUCKET' が存在します"
else
    # バケット名がグローバルに一意でない可能性があるので、別の方法で確認
    if gsutil ls gs://$STORAGE_BUCKET/ &>/dev/null 2>&1 || gcloud storage buckets describe gs://$STORAGE_BUCKET --project=$PROJECT_ID &>/dev/null 2>&1; then
        echo "✅ バケット '$STORAGE_BUCKET' が存在します（別プロジェクトの可能性あり）"
    else
        echo "⚠️  バケット '$STORAGE_BUCKET' が見つかりません（グローバルに一意でない可能性）"
        # バケット名がグローバルに一意でない場合でも、エラーではないので警告のみ
    fi
fi
echo ""

echo "【5】Cloud Run サービス"
echo "----------------------------------------"
if gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID &>/dev/null; then
    echo "✅ サービス '$SERVICE_NAME' が存在します"
    
    # 環境変数確認
    ENV_VARS=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(spec.template.spec.containers[0].env)" 2>/dev/null)
    if echo "$ENV_VARS" | grep -q "DB_HOST"; then
        echo "✅ 環境変数が設定されています"
    else
        echo "⚠️  環境変数が設定されていません（手順6が必要）"
        ALL_COMPLETE=false
    fi
    
    # Cloud SQL 接続確認
    CLOUDSQL_INSTANCES=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(spec.template.spec.containers[0].cloudSqlInstances)" 2>/dev/null)
    if [ -n "$CLOUDSQL_INSTANCES" ] && [ "$CLOUDSQL_INSTANCES" != "" ]; then
        echo "✅ Cloud SQL 接続が設定されています: $CLOUDSQL_INSTANCES"
    else
        # 環境変数にDB_HOSTが設定されていれば、接続は設定されている可能性が高い
        if echo "$ENV_VARS" | grep -q "DB_HOST"; then
            echo "⚠️  Cloud SQL 接続の確認に失敗しましたが、DB_HOST環境変数が設定されているため接続は設定されている可能性があります"
        else
            echo "⚠️  Cloud SQL 接続が設定されていません（手順6が必要）"
            ALL_COMPLETE=false
        fi
    fi
else
    echo "❌ サービス '$SERVICE_NAME' が見つかりません"
    ALL_COMPLETE=false
fi
echo ""

echo "【6】Cloud Build トリガー"
echo "----------------------------------------"
TRIGGERS=$(gcloud builds triggers list --project=$PROJECT_ID --format="value(name)" 2>/dev/null | grep -i "furusato\|deploy" || echo "")
if [ -n "$TRIGGERS" ]; then
    echo "✅ Cloud Build トリガーが存在します:"
    echo "$TRIGGERS" | while read trigger; do
        echo "   - $trigger"
    done
else
    echo "⚠️  Cloud Build トリガーが見つかりません（手順7が必要）"
    ALL_COMPLETE=false
fi
echo ""

echo "【7】cloudbuild.yaml"
echo "----------------------------------------"
if [ -f "cloudbuild.yaml" ]; then
    echo "✅ cloudbuild.yaml が存在します"
else
    echo "❌ cloudbuild.yaml が見つかりません"
    ALL_COMPLETE=false
fi
echo ""

echo "=========================================="
if [ "$ALL_COMPLETE" = true ]; then
    echo "✅ すべてのセットアップが完了しています！"
else
    echo "⚠️  一部のセットアップが未完了です"
    echo ""
    echo "未完了の項目を完了するには:"
    echo "1. 基本リソース作成: ./scripts/setup-gcp.sh $PROJECT_ID"
    echo "2. 環境変数・接続設定: ./scripts/run-next-steps.sh"
    echo "3. Cloud Build トリガー: 手動で作成（scripts/EXECUTE_NEXT_STEPS.md を参照）"
fi
echo "=========================================="
