#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

APP_NAME=resolvers

docker build \
	--build-arg COMMIT=$(git rev-parse --short HEAD) \
	--build-arg LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
	--progress plain \
	--tag "${APP_NAME}" \
	.

echo "INFO: running"
docker run \
	--env-file .env \
	--env PORT=4000 \
	--expose 4000 \
	--interactive \
	--name "${APP_NAME}" \
	--publish 4000:4000 \
	--rm \
	--tty \
	"${APP_NAME}"

