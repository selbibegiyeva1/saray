# 1. Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Production stage
FROM nginx:stable-alpine AS production

# Кладём билд Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Кладём наш конфиг nginx вместо дефолтного
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]