FROM node:18.17.1-alpine AS base

WORKDIR /app

FROM base AS builder

# get the dependencies and sources
COPY package.json yarn.lock ./

# install build dependencies, build the app
RUN yarn install --frozen-lockfile --ignore-optional && yarn cache clean --all

COPY src ./src
COPY public ./public
COPY tsconfig.json astro.config.mjs .env.example ./

RUN yarn build

FROM base AS release

# add nginx and its configuration
RUN apk add --update --no-cache nginx nginx-mod-http-brotli
COPY ./nginx.conf /etc/nginx/http.d/default.conf

# tell the app it will run on port 4000 in production mode
ENV PORT 4000
ENV NODE_ENV production

# get the dependencies and migrations stuff
COPY package.json yarn.lock .sequelizerc ./
COPY src/migrations ./src/migrations
COPY src/seeders ./src/seeders
# install the production dependencies only (depends on NODE_ENV)
RUN yarn install --frozen-lockfile --ignore-optional && yarn cache clean --all

# carry over the built code
COPY --from=builder /app/dist dist

EXPOSE 3000

ENTRYPOINT nginx; exec yarn --silent start
