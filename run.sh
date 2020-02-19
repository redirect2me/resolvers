#!/usr/bin/env bash
#
# run server locally
#

set -o errexit
set -o pipefail
set -o nounset

#
# load an .env file if it exists
#
ENV_FILE="./.env"
if [ -f "${ENV_FILE}" ]; then
    echo "INFO: loading '${ENV_FILE}'!"
    export $(cat "${ENV_FILE}")
fi

npx nodemon
