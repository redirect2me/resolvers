# syntax=docker/dockerfile:1.7-labs
FROM node:22-bookworm AS build

RUN apt-get update && apt-get install -y \
	dumb-init

WORKDIR /app
COPY . .
RUN npm install && \
	npm run build

FROM gcr.io/distroless/nodejs22-debian12

ARG COMMIT="(not set)"
ARG LASTMOD="(not set)"
ENV COMMIT=$COMMIT
ENV LASTMOD=$LASTMOD

WORKDIR /app
USER nonroot
COPY --chown=nonroot:nonroot --exclude=src . .
COPY --chown=nonroot:nonroot --from=build /app/node_modules /app/node_modules
COPY --chown=nonroot:nonroot --from=build /app/dist /app/dist
COPY --chown=nonroot:nonroot --from=build /usr/bin/dumb-init /usr/bin/dumb-init
EXPOSE 4000
ENV PORT 4000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/nodejs/bin/node", "/app/dist/server.js"]

