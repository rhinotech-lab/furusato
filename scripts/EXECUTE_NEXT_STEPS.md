# 次のステップ実行手順

WSL環境で以下のコマンドを実行してください。

## 前提条件
- `gcloud` CLI がインストールされている
- `gcloud auth login` で認証済み
- プロジェクトIDが分かっている

## 実行方法

### 方法1: スクリプトで自動実行

```bash
# WSL環境で実行
cd /home/kosei/ふるさと納税-制作管理システム
chmod +x scripts/execute-next-steps.sh
./scripts/execute-next-steps.sh YOUR_PROJECT_ID
```

### 方法2: 手動でコマンドを実行

#### 1. プロジェクトを設定
```bash
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID
```

#### 2. Cloud SQL 接続名を取得
```bash
CONNECTION_NAME=$(gcloud sql instances describe app-mysql \
    --format="value(connectionName)" \
    --project=$PROJECT_ID)
echo "接続名: $CONNECTION_NAME"
```

#### 3. Cloud Run 環境変数を設定
```bash
# MySQLパスワードを設定（setup-gcp.shで生成されたパスワードを使用）
export MYSQL_PASSWORD="your-mysql-password"

gcloud run services update furusato-frontend \
    --region=asia-northeast1 \
    --set-env-vars="DB_HOST=$CONNECTION_NAME,DB_NAME=app_db,DB_USER=app_user,DB_PASSWORD=$MYSQL_PASSWORD,GCS_BUCKET=furusato-storage-<project-id>" \
    --project=$PROJECT_ID
```

#### 4. Cloud SQL 接続を追加
```bash
gcloud run services update furusato-frontend \
    --add-cloudsql-instances=$CONNECTION_NAME \
    --region=asia-northeast1 \
    --project=$PROJECT_ID
```

#### 5. Cloud Build トリガーを作成（GitHub接続後）

まず、GitHub接続を作成（初回のみ）:
```bash
gcloud builds connections create github \
    --region=asia-northeast1 \
    --project=$PROJECT_ID
```

GitHub認証を完了後、トリガーを作成:
```bash
gcloud builds triggers create github \
    --name="furusato-deploy-trigger" \
    --repo-name="YOUR_REPO_NAME" \
    --repo-owner="YOUR_GITHUB_USERNAME" \
    --branch-pattern="^main$" \
    --build-config="cloudbuild.yaml" \
    --region=asia-northeast1 \
    --project=$PROJECT_ID
```

## 確認

設定が完了したら、以下で確認できます:

```bash
# Cloud Run サービスの環境変数を確認
gcloud run services describe furusato-frontend \
    --region=asia-northeast1 \
    --project=$PROJECT_ID \
    --format="value(spec.template.spec.containers[0].env)"

# Cloud SQL 接続を確認
gcloud run services describe furusato-frontend \
    --region=asia-northeast1 \
    --project=$PROJECT_ID \
    --format="value(spec.template.spec.containers[0].env)"
```
