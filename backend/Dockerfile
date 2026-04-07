FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

RUN corepack enable && yarn install

COPY . .

RUN yarn build

EXPOSE 3010

CMD ["node", "dist/main"]
