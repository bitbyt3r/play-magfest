# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY /nginx.conf.template /etc/nginx/nginx.conf.template
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 5442
CMD /bin/sh -c "envsubst '\$BACKEND_URL' '\$SERVER_PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"