FROM node:18.18.1-alpine AS base
WORKDIR /app

RUN npm install --global pnpm

FROM base AS builder

# get the dependencies and sources
COPY package.json pnpm-lock.yaml ./

# install build dependencies, build the app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY src ./src
COPY public ./public
COPY tsconfig.json astro.config.mjs .env.example ./

RUN pnpm build

FROM base AS release

# add nginx and its configuration
RUN apk add --update --no-cache nginx nginx-mod-http-brotli
COPY ./nginx.conf /etc/nginx/http.d/default.conf

# tell the app it will run on port 4000 in production mode
ENV PORT 4000
ENV NODE_ENV production

# get the dependencies and migrations stuff
COPY package.json pnpm-lock.yaml .sequelizerc ./
COPY src/migrations ./src/migrations
COPY src/seeders ./src/seeders
# install the production dependencies only (depends on NODE_ENV)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# carry over the built code
COPY --from=builder /app/dist dist

EXPOSE 3000

ENTRYPOINT nginx; exec pnpm start
