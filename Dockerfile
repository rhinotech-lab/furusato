# ビルドステージ（変更なし）
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# 本番ステージ
FROM nginx:1.27-alpine
WORKDIR /etc/nginx/conf.d

# nginx 設定を「テンプレート」として一旦別の名前でコピー
COPY nginx.conf ./default.conf.template

# ビルド成果物をコピー
COPY --from=build /app/dist /usr/share/nginx/html

ENV PORT 8080
EXPOSE 8080

# テンプレートを元に、環境変数を反映させた「本物の」default.conf を作って起動
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"