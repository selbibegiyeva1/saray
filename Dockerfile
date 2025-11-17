# 1. Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Сначала зависимости (лучше кешируется)
COPY package*.json ./
RUN npm install

# Потом весь код
COPY . .

# Сборка (Vite по умолчанию кладёт в /app/dist)
RUN npm run build


# 2. Production stage
FROM nginx:stable-alpine AS production

# Копируем dist вместо build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]