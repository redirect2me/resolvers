#/usr/bin/env bash
#
# download the list of rdap servers from IANA
#

set -o errexit
set -o pipefail
set -o nounset

echo "INFO: starting rdap  update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

TARGET_DIR="$(dirname "$0")"
echo "INFO: target directory is ${TARGET_DIR}"

URL="https://data.iana.org/rdap/dns.json"

curl --silent "${URL}" >${TARGET_DIR}/dns.json

DIFF=$(git diff --name-only "-G^[^#].+" "${TARGET_DIR}/dns.json")

if [ "${DIFF}" == "" ]; then
    echo "INFO: no substantive changes, reverting"
    # NOTE: this won't work if we aren't within the repo directory, but we generally are
    git checkout "${TARGET_DIR}/dns.json"
else
    echo "INFO: actual changes detected"
fi

echo "INFO: complete rdap  update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
