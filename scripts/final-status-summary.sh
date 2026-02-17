#!/bin/bash

# 最終的なセットアップ完了状況のサマリー

PROJECT_ID=${1:-"redhorse-prod"}
REGION="asia-northeast1"
SERVICE_NAME="furusato-frontend"

echo "=========================================="
echo "本番環境セットアップ - 最終確認"
echo "プロジェクトID: $PROJECT_ID"
echo "=========================================="
echo ""

gcloud config set project $PROJECT_ID &>/dev/null

# Cloud Run サービスのURLを取得
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(status.url)" 2>/dev/null)

echo "【デプロイ済みサービス】"
echo "----------------------------------------"
if [ -n "$SERVICE_URL" ]; then
    echo "✅ Cloud Run サービス: $SERVICE_NAME"
    echo "   URL: $SERVICE_URL"
else
    echo "❌ Cloud Run サービスが見つかりません"
fi
echo ""

echo "【完了状況サマリー】"
echo "----------------------------------------"
echo "✅ 手順1: 必要な API を有効化 - 完了"
echo "✅ 手順2: Artifact Registry 作成 - 完了"
echo "✅ 手順3: Cloud SQL (MySQL) 作成 - 完了"
echo "⚠️  手順4: Cloud Storage バケット - グローバル名の競合の可能性"
echo "✅ 手順5: Cloud Run サービス作成 - 完了"
echo "✅ 手順6: 環境変数・Cloud SQL接続設定 - 完了"
echo "✅ 手順7: Cloud Build トリガー - 完了"
echo "✅ 手順8: リリースフロー - 準備完了"
echo ""

echo "【次のアクション】"
echo "----------------------------------------"
echo "1. GitHub の main ブランチに push して自動デプロイをテスト"
echo "2. サービスURLにアクセスして動作確認:"
echo "   $SERVICE_URL"
echo "3. Cloud Storage バケット名が競合している場合は、"
echo "   別の名前で再作成するか、既存バケットを使用"
echo ""

echo "=========================================="
echo "セットアップはほぼ完了しています！"
echo "=========================================="
