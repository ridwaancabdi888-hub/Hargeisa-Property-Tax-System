# Frontend production image: build the static Vite bundle, serve it with nginx,
# which also reverse-proxies /api and /uploads to the server container — this
# reproduces the same same-origin cookie/CSRF setup the Vite dev proxy gives us.

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
