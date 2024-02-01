#/usr/bin/env bash
#
# download the list of TLDs from ICANN
#

set -o errexit
set -o pipefail
set -o nounset

SCRIPT_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_HOME="$(realpath "${SCRIPT_HOME}/..")"

echo "INFO: starting ICANN update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

TARGET_DIR="${REPO_HOME}/data/icann"
echo "INFO: target directory is ${TARGET_DIR}"

URL="https://data.iana.org/TLD/tlds-alpha-by-domain.txt"

curl --silent "${URL}" >${TARGET_DIR}/tlds-alpha-by-domain.txt

DIFF=$(git diff --name-only "-G^[^#].+" "${TARGET_DIR}/tlds-alpha-by-domain.txt")

if [ "${DIFF}" == "" ]; then
    echo "INFO: no substantive changes, reverting"
    # NOTE: this won't work if we aren't within the repo directory, but we generally are
    git checkout "${TARGET_DIR}/tlds-alpha-by-domain.txt"
else
    echo "INFO: actual changes detected"
    ${SCRIPT_HOME}/deltagen.sh "data/icann/tlds-alpha-by-domain.txt" HEAD >"${TARGET_DIR}/deltas/$(date -u +%Y-%m-%d).txt"
fi

echo "INFO: complete ICANN update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
