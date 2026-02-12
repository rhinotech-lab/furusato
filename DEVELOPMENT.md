# 開発ガイド

## 前提条件
- Node.js 18 以上
- npm

## ローカル開発
1. 依存関係をインストール:
   `npm install`
2. 開発サーバーを起動:
   `npm run dev`

## ビルド
- `npm run build`
- 出力は `dist/` に生成されます

## Docker
### Compose で起動
1. `docker compose up --build`
2. ブラウザで `http://localhost:8080` を開く

### 単体で起動
1. `docker build -t furusato-app .`
2. `docker run --rm -p 8080:80 furusato-app`
