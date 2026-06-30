FROM node:20-alpine
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock* ./

RUN yarn install --production && yarn cache clean

COPY . .

RUN yarn build

CMD ["yarn", "run", "docker-start"]
