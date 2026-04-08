FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock* ./

RUN npm install

COPY . .

ARG VITE_API_URL=/api
ARG VITE_WS_URL=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

FROM nginx:1.25-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV PORT=80

CMD ["nginx", "-g", "daemon off;"]
