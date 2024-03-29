#!/usr/bin/env bash
#
# commits and pushes changes in the data directory (to be called from the Github Action)
#

set -o errexit
set -o pipefail
set -o nounset

SCRIPT_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_HOME="$(realpath "${SCRIPT_HOME}/..")"

echo "INFO: starting data commit at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

TARGET_DIR="${REPO_HOME}/data"

echo "INFO: target directory is ${TARGET_DIR}"

DIFF=$(git diff --name-only "${TARGET_DIR}")
#DIFF=()
#while IFS= read -r line; do
#    DIFF+=( "$line" )
#done < <(git diff --name-only "${TARGET_DIR}")

if [ "${DIFF}" == "" ]; then
	echo "INFO: nothing to commit"
else
	echo "INFO: committing changes to ${DIFF}"
	git add ${DIFF}
	git add $(git ls-files --others --exclude-standard "${TARGET_DIR}")
	git commit -m "Databases updated at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
	git push deploy main
fi

echo "INFO: completed data commit at $(date -u +%Y-%m-%dT%H:%M:%SZ)"



