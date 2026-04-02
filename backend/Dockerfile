FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN yarn install --immutable

COPY . .

RUN yarn build

EXPOSE 3010

CMD ["node", "dist/main"]
