#!/bin/bash

# バケット名変更の確認スクリプト

PROJECT_ID=${1:-"redhorse-prod"}
REGION="asia-northeast1"
SERVICE_NAME="furusato-frontend"
NEW_BUCKET="furusato-storage-${PROJECT_ID//-/}"

echo "=========================================="
echo "バケット名変更の確認"
echo "=========================================="
echo ""

gcloud config set project $PROJECT_ID &>/dev/null

echo "【1】新しいバケットの存在確認"
echo "----------------------------------------"
if gsutil ls -b gs://$NEW_BUCKET/ &>/dev/null 2>&1; then
    echo "✅ バケット '$NEW_BUCKET' が存在します"
    
    # バケットの詳細情報を取得
    echo ""
    echo "バケット情報:"
    gsutil ls -L -b gs://$NEW_BUCKET/ 2>/dev/null | head -5 || echo "  詳細情報の取得に失敗しました"
else
    echo "❌ バケット '$NEW_BUCKET' が見つかりません"
    echo "   作成してください: gsutil mb -p $PROJECT_ID -l $REGION gs://$NEW_BUCKET/"
fi
echo ""

echo "【2】Cloud Run の環境変数確認"
echo "----------------------------------------"
# JSON形式で環境変数を取得
ENV_JSON=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="json" 2>/dev/null)

if echo "$ENV_JSON" | grep -q "GCS_BUCKET"; then
    # jqが使える場合はjqで、使えない場合はgrep/sedで抽出
    if command -v jq &> /dev/null; then
        GCS_BUCKET_VALUE=$(echo "$ENV_JSON" | jq -r '.spec.template.spec.containers[0].env[] | select(.name=="GCS_BUCKET") | .value' 2>/dev/null)
    else
        # jqがない場合の代替方法
        GCS_BUCKET_VALUE=$(echo "$ENV_JSON" | grep -A 2 '"name": "GCS_BUCKET"' | grep '"value"' | sed 's/.*"value": "\([^"]*\)".*/\1/' | head -1)
    fi
    
    if [ -n "$GCS_BUCKET_VALUE" ] && [ "$GCS_BUCKET_VALUE" != "null" ]; then
        if [ "$GCS_BUCKET_VALUE" = "$NEW_BUCKET" ]; then
            echo "✅ GCS_BUCKET 環境変数が正しく設定されています: $GCS_BUCKET_VALUE"
        else
            echo "⚠️  GCS_BUCKET 環境変数の値が期待と異なります"
            echo "   現在の値: $GCS_BUCKET_VALUE"
            echo "   期待値: $NEW_BUCKET"
            echo ""
            echo "   環境変数を更新するには:"
            echo "   gcloud run services update $SERVICE_NAME \\"
            echo "       --region=$REGION \\"
            echo "       --update-env-vars=\"GCS_BUCKET=$NEW_BUCKET\" \\"
            echo "       --project=$PROJECT_ID"
        fi
    else
        echo "⚠️  GCS_BUCKET 環境変数の値を取得できませんでした"
        echo "   手動で確認してください:"
        echo "   gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format=\"value(spec.template.spec.containers[0].env)\""
    fi
else
    echo "❌ GCS_BUCKET 環境変数が見つかりません"
    echo "   環境変数を設定してください:"
    echo "   gcloud run services update $SERVICE_NAME \\"
    echo "       --region=$REGION \\"
    echo "       --update-env-vars=\"GCS_BUCKET=$NEW_BUCKET\" \\"
    echo "       --project=$PROJECT_ID"
fi
echo ""

echo "【3】アプリケーションコード内の参照確認"
echo "----------------------------------------"
echo "アプリケーションコード内でバケット名を直接参照している箇所を確認中..."
HARDCODED=$(grep -r "app-storage-bucket" --include="*.php" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" backend/ pages/ services/ 2>/dev/null | grep -v node_modules | grep -v ".git" || echo "")
if [ -z "$HARDCODED" ]; then
    echo "✅ バケット名の直接参照は見つかりませんでした（環境変数を使用している想定）"
else
    echo "⚠️  以下の箇所でバケット名が直接参照されています:"
    echo "$HARDCODED"
fi
echo ""

echo "【4】Laravel の設定確認"
echo "----------------------------------------"
if [ -f "backend/config/filesystems.php" ]; then
    echo "✅ filesystems.php が存在します"
    echo "   環境変数を使用している場合は問題ありません"
    echo "   GCSを使用する場合は、Laravel用のGCSドライバー設定が必要です"
else
    echo "⚠️  filesystems.php が見つかりません"
fi
echo ""

echo "=========================================="
echo "確認完了"
echo "=========================================="
echo ""
echo "【次のステップ】"
echo "1. アプリケーションが GCS_BUCKET 環境変数を使用していることを確認"
echo "2. LaravelでGCSを使用する場合は、適切なドライバー設定が必要"
echo "3. 旧バケットにデータがある場合は移行:"
echo "   gsutil -m cp -r gs://app-storage-bucket/* gs://$NEW_BUCKET/"
echo ""
