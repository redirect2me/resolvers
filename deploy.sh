#!/bin/bash
#docker login -u oauth2accesstoken -p "$(gcloud auth print-access-token)" https://gcr.io

set -o errexit
set -o pipefail
set -o nounset

COMMIT=$(git rev-parse --short HEAD)
LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)

docker build -t resolvers .
docker tag resolvers:latest gcr.io/mysideprojects/resolvers:latest
docker push gcr.io/mysideprojects/resolvers:latest

gcloud beta run deploy resolvers \
	--allow-unauthenticated \
	--image gcr.io/mysideprojects/resolvers \
	--platform managed \
	--project mysideprojects \
    --region us-central1 \
	--update-env-vars "COMMIT=${COMMIT},LASTMOD=${LASTMOD}"

echo "INFO: deployed ${COMMIT} (${LASTMOD})"
