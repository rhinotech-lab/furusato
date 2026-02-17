# GCP セットアップ手動実行手順

## 前提条件
1. `gcloud` CLI がインストールされていること
2. GCP プロジェクトが作成済みであること
3. `gcloud auth login` で認証済みであること

## 実行手順

### 1. プロジェクトIDを設定
```bash
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID
```

### 2. 必要な API を有効化
```bash
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    sqladmin.googleapis.com \
    storage-component.googleapis.com \
    --project=$PROJECT_ID
```

### 3. Artifact Registry リポジトリを作成
```bash
gcloud artifacts repositories create app-images \
    --repository-format=docker \
    --location=asia-northeast1 \
    --description="Application container images" \
    --project=$PROJECT_ID
```

### 4. Cloud SQL (MySQL) インスタンスを作成
```bash
# インスタンス作成（数分かかります）
gcloud sql instances create app-mysql \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=asia-northeast1 \
    --root-password=$(openssl rand -base64 32) \
    --project=$PROJECT_ID

# データベース作成
gcloud sql databases create app_db \
    --instance=app-mysql \
    --project=$PROJECT_ID

# ユーザー作成
MYSQL_PASSWORD=$(openssl rand -base64 32)
gcloud sql users create app_user \
    --instance=app-mysql \
    --password=$MYSQL_PASSWORD \
    --project=$PROJECT_ID

echo "MySQL パスワード: $MYSQL_PASSWORD"
# このパスワードを安全に保管してください
```

### 5. Cloud Storage バケットを作成
```bash
gsutil mb -p $PROJECT_ID -l asia-northeast1 gs://furusato-storage-${PROJECT_ID//-/}/
```

### 6. Cloud Run サービスを作成（初回）
```bash
gcloud run deploy furusato-frontend \
    --image=gcr.io/cloudrun/hello \
    --region=asia-northeast1 \
    --platform=managed \
    --allow-unauthenticated \
    --port=8080 \
    --project=$PROJECT_ID
```

### 7. Cloud Build トリガーを作成（GitHub連携）
```bash
# GitHub リポジトリを接続（初回のみ）
gcloud builds triggers create github \
    --name="furusato-deploy-trigger" \
    --repo-name="your-repo-name" \
    --repo-owner="your-github-username" \
    --branch-pattern="^main$" \
    --build-config="cloudbuild.yaml" \
    --region=asia-northeast1 \
    --project=$PROJECT_ID
```

### 8. 環境変数の設定
Cloud Run サービスの環境変数は、Cloud Console から設定するか、以下のコマンドで設定できます：

```bash
# Cloud SQL インスタンスの接続名を取得
CONNECTION_NAME=$(gcloud sql instances describe app-mysql \
    --format="value(connectionName)" \
    --project=$PROJECT_ID)

# 環境変数を設定
gcloud run services update furusato-frontend \
    --region=asia-northeast1 \
    --set-env-vars="DB_HOST=$CONNECTION_NAME,DB_NAME=app_db,DB_USER=app_user,DB_PASSWORD=YOUR_PASSWORD,GCS_BUCKET=furusato-storage-${PROJECT_ID//-/}" \
    --project=$PROJECT_ID

# Cloud SQL 接続を追加
gcloud run services update furusato-frontend \
    --add-cloudsql-instances=$CONNECTION_NAME \
    --region=asia-northeast1 \
    --project=$PROJECT_ID
```

## 注意事項
- MySQL パスワードは安全に保管してください
- `cloudbuild.yaml` の `_API_URL` を実際のバックエンドURLに変更してください
- Secret Manager を使用する場合は、環境変数ではなく Secret として設定してください
