# ビルドステージ
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# 本番ステージ
FROM nginx:1.27-alpine
WORKDIR /etc/nginx/conf.d

# nginx 設定をコピー
COPY nginx.conf ./default.conf

# ビルド成果物を nginx 配下にコピー
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run が参照するポート
ENV PORT 8080
EXPOSE 8080

# 起動時に envsubst で $PORT を nginx.conf に反映してから起動
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"

