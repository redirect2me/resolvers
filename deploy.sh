#!/bin/bash
#docker login -u oauth2accesstoken -p "$(gcloud auth print-access-token)" https://gcr.io

set -o errexit
set -o pipefail
set -o nounset

COMMIT=$(git rev-parse --short HEAD)
LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)

git push heroku

heroku config:set "COMMIT=${COMMIT}" "LASTMOD=${LASTMOD}"
