#!/usr/bin/env bash
#
# updates the Mozilla public suffix list () to generate a list of TLDs to check for domain availability
#

set -o errexit
set -o pipefail
set -o nounset

echo "INFO: starting PublicSuffix update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

TARGET_DIR="$(dirname "$0")"
echo "INFO: target directory is ${TARGET_DIR}"

URL="https://publicsuffix.org/list/public_suffix_list.dat"

curl --silent "${URL}" >${TARGET_DIR}/public_suffix_list.dat

DIFF=$(git diff --name-only "${TARGET_DIR}/public_suffix_list.dat")

if [ "${DIFF}" == "" ]; then
    echo "INFO: no changes"
else
    echo "INFO: changes detected"
fi

echo "INFO: complete PublicSuffix update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"