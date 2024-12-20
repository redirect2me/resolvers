#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

COMMIT=$(git rev-parse --short HEAD)
LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)

git push -f heroku

heroku config:set "COMMIT=${COMMIT}" "LASTMOD=${LASTMOD}"
