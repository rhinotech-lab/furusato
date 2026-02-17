#!/bin/bash

# Cloud Storage バケット名の競合を解決するスクリプト
# プロジェクトIDを含む一意なバケット名に変更します

PROJECT_ID=${1:-"redhorse-prod"}
REGION="asia-northeast1"
OLD_BUCKET="app-storage-bucket"
NEW_BUCKET="furusato-storage-${PROJECT_ID//-/}"  # ハイフンを削除

echo "=========================================="
echo "Cloud Storage バケット名を変更します"
echo "=========================================="
echo "旧バケット名: $OLD_BUCKET"
echo "新バケット名: $NEW_BUCKET"
echo "プロジェクトID: $PROJECT_ID"
echo ""

# 新バケットを作成
echo "【1】新しいバケットを作成中..."
if gsutil mb -p $PROJECT_ID -l $REGION gs://$NEW_BUCKET/ 2>&1; then
    echo "✅ バケット '$NEW_BUCKET' を作成しました"
else
    echo "⚠️  バケット '$NEW_BUCKET' の作成に失敗しました（既に存在する可能性）"
    # 既に存在するか確認
    if gsutil ls -b gs://$NEW_BUCKET/ &>/dev/null 2>&1; then
        echo "✅ バケット '$NEW_BUCKET' は既に存在します"
    else
        echo "❌ エラーが発生しました。別のバケット名を試してください"
        exit 1
    fi
fi
echo ""

# Cloud Run の環境変数を更新
echo "【2】Cloud Run の環境変数を更新中..."
SERVICE_NAME="furusato-frontend"

# 現在の環境変数を取得
CURRENT_ENV=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="value(spec.template.spec.containers[0].env)" 2>/dev/null)

# 環境変数を更新（GCS_BUCKETを新しい名前に変更）
if echo "$CURRENT_ENV" | grep -q "GCS_BUCKET"; then
    # 既存の環境変数を保持しつつ、GCS_BUCKETのみ更新
    # 環境変数を個別に設定する必要がある
    echo "環境変数を更新するには、以下のコマンドを実行してください:"
    echo ""
    echo "gcloud run services update $SERVICE_NAME \\"
    echo "    --region=$REGION \\"
    echo "    --update-env-vars=\"GCS_BUCKET=$NEW_BUCKET\" \\"
    echo "    --project=$PROJECT_ID"
    echo ""
    read -p "上記のコマンドを実行しますか？ (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gcloud run services update $SERVICE_NAME \
            --region=$REGION \
            --update-env-vars="GCS_BUCKET=$NEW_BUCKET" \
            --project=$PROJECT_ID
        echo "✅ 環境変数を更新しました"
    else
        echo "⚠️  環境変数の更新をスキップしました"
    fi
else
    echo "⚠️  GCS_BUCKET環境変数が見つかりません"
fi
echo ""

echo "=========================================="
echo "完了しました！"
echo "=========================================="
echo ""
echo "新しいバケット名: $NEW_BUCKET"
echo ""
echo "【注意】"
echo "- アプリケーションコード内でバケット名を参照している場合は、"
echo "  新しいバケット名に更新してください"
echo "- 旧バケットにデータがある場合は、移行が必要です:"
echo "  gsutil -m cp -r gs://$OLD_BUCKET/* gs://$NEW_BUCKET/"
echo ""
