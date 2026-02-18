# WSL環境での開発環境セットアップ手順書

このドキュメントは、WSL（Windows Subsystem for Linux）内にDocker Engineをインストールし、開発環境を立ち上げる手順を説明します。  
※ Docker Desktop は使用しません。WSL内で直接Dockerを動作させます。

## 目次

1. [前提条件](#前提条件)
2. [WSL環境の準備](#wsl環境の準備)
3. [Docker Engineのインストール](#docker-engineのインストール)
4. [Dockerの自動起動設定](#dockerの自動起動設定)
5. [プロジェクトのセットアップ](#プロジェクトのセットアップ)
6. [開発環境の起動](#開発環境の起動)
7. [開発時のよくある操作](#開発時のよくある操作)
8. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- **Windows 10/11**（WSL2対応）
- **WSL2** がインストール済み
- **Ubuntu**（またはDebianベースのLinuxディストリビューション）がWSL2で動作していること
- **Node.js 20以上**（フロントエンド開発用）

### WSL2の確認

PowerShellで以下を実行:

```powershell
wsl --list --verbose
```

出力例:
```
  NAME      STATE           VERSION
* Ubuntu    Running         2
```

`VERSION` が `2` であることを確認してください。  
`1` の場合は以下でアップグレード:

```powershell
wsl --set-version Ubuntu 2
```

---

## WSL環境の準備

### 1. WSLに入る

PowerShellから:

```powershell
wsl -d Ubuntu
```

### 2. パッケージの更新

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 3. 日本語ロケールの設定（推奨）

日本語ファイル名を正しく扱うために設定:

```bash
sudo apt-get install -y locales
sudo locale-gen ja_JP.UTF-8

# ~/.bashrc に追加
echo 'export LANG=ja_JP.UTF-8' >> ~/.bashrc
echo 'export LC_ALL=ja_JP.UTF-8' >> ~/.bashrc
source ~/.bashrc
```

---

## Docker Engineのインストール

WSL内に直接Docker Engineをインストールします。

### 1. 必要なパッケージをインストール

```bash
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### 2. DockerのGPGキーとリポジトリを追加

```bash
# GPGキーを追加
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# リポジトリを追加
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 3. Docker Engineをインストール

```bash
sudo apt-get update
sudo apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin
```

### 4. 現在のユーザーをdockerグループに追加

`sudo` なしでDockerコマンドを実行できるようにします:

```bash
sudo usermod -aG docker $USER
```

グループ設定を反映するため、**WSLを一度閉じて再度開きます**:

```bash
exit
```

PowerShellから再度WSLに入る:

```powershell
wsl -d Ubuntu
```

### 5. Dockerデーモンの起動

```bash
sudo service docker start
```

### 6. 動作確認

```bash
docker --version
docker compose version
docker run --rm hello-world
```

`Hello from Docker!` と表示されれば成功です。

---

## Dockerの自動起動設定

WSLではデフォルトでsystemdが有効でないため、Dockerデーモンを手動で起動する必要があります。  
以下のいずれかの方法で自動起動を設定します。

### 方法A: systemdを有効にする（推奨）

WSL2はsystemdをサポートしています。`/etc/wsl.conf` を編集:

```bash
sudo tee /etc/wsl.conf << 'EOF'
[boot]
systemd=true
EOF
```

WSLを再起動（PowerShellで実行）:

```powershell
wsl --shutdown
wsl -d Ubuntu
```

再起動後、Dockerを自動起動に設定:

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

確認:

```bash
sudo systemctl status docker
```

### 方法B: ~/.bashrcで自動起動する

systemdを使わない場合、`~/.bashrc` に以下を追加:

```bash
echo '# Docker自動起動
if service docker status 2>&1 | grep -q "is not running"; then
    sudo service docker start > /dev/null 2>&1
fi' >> ~/.bashrc
```

`sudo` をパスワードなしで実行できるようにする（Docker起動用のみ）:

```bash
sudo tee /etc/sudoers.d/docker-service << 'EOF'
%docker ALL=(ALL) NOPASSWD: /usr/sbin/service docker *
EOF
```

---

## プロジェクトのセットアップ

### 1. 作業ディレクトリに移動

```bash
cd ~/ふるさと納税-制作管理システム
```

> **重要**: プロジェクトは必ずWSLのファイルシステム（`/home/` 配下）に配置してください。  
> Windowsのファイルシステム（`/mnt/c/` など）ではパフォーマンスが大幅に低下し、パーミッションの問題も発生します。

### 2. リポジトリのクローン（まだの場合）

```bash
cd ~
git clone <repository-url> ふるさと納税-制作管理システム
cd ふるさと納税-制作管理システム
```

### 3. 環境変数ファイルの作成

バックエンドの `.env` ファイルを作成:

```bash
cd backend

# .envファイルが存在しない場合のみ作成
if [ ! -f .env ]; then
    cat > .env << 'EOF'
APP_NAME="ふるさと納税制作管理システム"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080
APP_KEY=

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=furusato_db
DB_USERNAME=furusato_user
DB_PASSWORD=furusato_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

LOG_CHANNEL=stack
LOG_LEVEL=debug

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
EOF
    echo ".envファイルを作成しました"
else
    echo ".envファイルは既に存在します"
fi

cd ..
```

---

## 開発環境の起動

### 1. Dockerデーモンの起動確認

```bash
# Dockerが起動しているか確認
sudo service docker status

# 起動していない場合は起動
sudo service docker start
```

### 2. Docker Composeでコンテナをビルド・起動

```bash
# プロジェクトルートディレクトリで実行
docker compose up --build -d
```

初回はイメージのビルドに数分かかります。

### 3. コンテナの状態を確認

```bash
docker compose ps
```

以下の3つのコンテナがすべて `Up` 状態であることを確認:

| コンテナ名 | サービス | ポート |
|---|---|---|
| furusato_mysql | MySQL 8.0 | 3306 |
| furusato_backend | Laravel (PHP-FPM) | 8000:9000 |
| furusato_nginx | Nginx | 8080:80 |

> **注意**: フロントエンドは `npm run dev` で別途起動します（Docker Composeには含まれていません）。

### 4. Laravelの初期設定

```bash
# Composerの依存関係をインストール
docker compose exec backend composer install

# アプリケーションキーを生成
docker compose exec backend php artisan key:generate

# ストレージの権限を設定
docker compose exec backend bash -c "chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache"

# Sanctumのマイグレーションを公開
docker compose exec backend php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# データベースマイグレーション
docker compose exec backend php artisan migrate

# シーダーを実行（サンプルユーザーを作成）
docker compose exec backend php artisan db:seed
```

### 5. フロントエンドの起動

```bash
# プロジェクトルートで実行
npm install
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。  
Viteのプロキシ設定により、`/api` へのリクエストは自動的に `http://localhost:8080` に転送されます。

### 6. アクセス確認

ブラウザ（Windows側）で以下にアクセス:

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:8080/api |
| MySQL | localhost:3306 |

### デフォルトログインユーザー

| ロール | メールアドレス | パスワード |
|---|---|---|
| 管理者 | `admin@example.com` | `password` |
| 制作者 | `creator@example.com` | `password` |
| 自治体ユーザー | `municipality@example.com` | `password` |
| 事業者ユーザー | `business@example.com` | `password` |

---

## 開発時のよくある操作

### コンテナの操作

```bash
# コンテナの停止
docker compose stop

# コンテナの再起動
docker compose restart

# コンテナの停止と削除
docker compose down

# ログの確認（リアルタイム）
docker compose logs -f

# 特定のサービスのログ
docker compose logs -f backend
docker compose logs -f mysql
```

### データベースの操作

```bash
# マイグレーション実行
docker compose exec backend php artisan migrate

# マイグレーションロールバック
docker compose exec backend php artisan migrate:rollback

# シーダー実行
docker compose exec backend php artisan db:seed

# データベースの完全リセット
docker compose down -v
docker compose up --build -d
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
```

### バックエンドコンテナ内での操作

```bash
# コンテナに入る
docker compose exec backend bash

# コンテナ内で実行できるコマンド例
php artisan cache:clear
php artisan config:clear
php artisan route:list
composer install
composer update
```

---

## トラブルシューティング

### 1. `docker: command not found`

**原因**: Dockerがインストールされていない、またはPATHが通っていない

**解決方法**:
```bash
# Dockerがインストールされているか確認
which docker

# インストールされていない場合は「Docker Engineのインストール」セクションを再実行
# インストール済みの場合はシェルを再起動
exec $SHELL
```

### 2. `permission denied` でDockerコマンドが実行できない

**原因**: ユーザーがdockerグループに追加されていない

**解決方法**:
```bash
sudo usermod -aG docker $USER

# WSLを再起動
exit
# PowerShellから: wsl -d Ubuntu
```

### 3. `Cannot connect to the Docker daemon`

**原因**: Dockerデーモンが起動していない

**解決方法**:
```bash
# Dockerデーモンを起動
sudo service docker start

# 状態を確認
sudo service docker status
```

### 4. ポートが既に使用されている

**症状**: `Error: bind: address already in use`

**解決方法**:
```bash
# 使用中のポートを確認
sudo lsof -i :3000
sudo lsof -i :8080
sudo lsof -i :3306

# 該当プロセスを停止するか、docker-compose.yml のポート番号を変更
```

### 5. データベース接続エラー

**症状**: `SQLSTATE[HY000] [2002] Connection refused`

**解決方法**:
```bash
# MySQLコンテナの状態を確認
docker compose ps mysql

# ログを確認
docker compose logs mysql

# MySQLコンテナを再起動して待機
docker compose restart mysql
sleep 30

# 再度マイグレーションを実行
docker compose exec backend php artisan migrate
```

### 6. ファイルパーミッションエラー

**症状**: `The stream or file ".../storage/logs/laravel.log" could not be opened`

**解決方法**:
```bash
docker compose exec backend bash -c "chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache"
```

### 7. Sanctumのテーブルが見つからない

**症状**: `SQLSTATE[42S02]: Base table or view not found: 1146 Table 'furusato_db.personal_access_tokens' doesn't exist`

**解決方法**:
```bash
docker compose exec backend php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
docker compose exec backend php artisan migrate
```

### 8. vendorディレクトリが空

**症状**: Laravel のクラスが見つからないエラー

**原因**: Docker Composeのボリュームマウントにより `vendor` が空になる場合がある

**解決方法**:
```bash
docker compose exec backend composer install
```

### 9. コンテナが起動しない（Exited状態）

**解決方法**:
```bash
# ログを確認
docker compose logs

# 完全リビルド
docker compose down -v
docker compose up --build -d
```

### 10. WSL2のメモリ不足

**症状**: システムが重い、コンテナが頻繁にクラッシュ

**解決方法**:

Windowsのユーザーディレクトリに `.wslconfig` ファイルを作成（PowerShellで実行）:

```powershell
@"
[wsl2]
memory=4GB
processors=2
swap=2GB
"@ | Out-File -FilePath "$env:USERPROFILE\.wslconfig" -Encoding utf8
```

WSLを再起動:

```powershell
wsl --shutdown
wsl -d Ubuntu
```

---

## パフォーマンス最適化

### ファイルシステム

- プロジェクトは必ず **WSLのファイルシステム**（`/home/` 配下）に配置してください
- `/mnt/c/` などWindowsファイルシステム上ではI/O性能が大幅に低下します

### WSL2のリソース調整

`.wslconfig`（`C:\Users\<ユーザー名>\.wslconfig`）でメモリやCPUを調整:

```ini
[wsl2]
memory=8GB
processors=4
swap=4GB
```

変更後はWSLを再起動してください。

---

## 次のステップ

開発環境が正常に起動したら、以下を参照してください:

- [DEVELOPMENT.md](../DEVELOPMENT.md) - 開発ガイド
- [README.md](../README.md) - プロジェクト概要
- [doc/PRODUCTION.md](./PRODUCTION.md) - 本番環境構築手順

## 参考リンク

- [WSL公式ドキュメント](https://learn.microsoft.com/ja-jp/windows/wsl/)
- [Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Docker Compose公式ドキュメント](https://docs.docker.com/compose/)
