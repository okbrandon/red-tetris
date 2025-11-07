FROM node:22-alpine AS build

WORKDIR /app

COPY . /app

RUN npm install

ARG VITE_HOST_NAME
ENV VITE_HOST_NAME=${VITE_HOST_NAME}

ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
