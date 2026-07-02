FROM node:20-alpine
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare yarn@4.14.1 --activate

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --immutable

COPY . .

RUN yarn build

USER node

CMD ["yarn", "run", "docker-start"]
