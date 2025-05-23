FROM oven/bun AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY bun.lockb ./

RUN bun install

COPY . .

RUN bun run build

FROM nginx:stable-alpine AS deploy

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/build .

ENTRYPOINT ["nginx", "-g", "daemon off;"]