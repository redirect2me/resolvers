#!/usr/bin/env bash
#
# backfill the changelog history: just a one-shot, but keeping in case I want to change the format
#

set -o errexit
set -o pipefail
set -o nounset

SCRIPT_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_HOME="$(realpath "${SCRIPT_HOME}/..")"

# check if 1 parameter
if [ $# -ne 1 ]; then
    echo "Usage: $(basename "$0") filename"
    echo "       filename should be a relative path from the root of the repository"
    exit 1
fi

FILENAME=$1
DELTA_PATH="$(dirname "${REPO_HOME}/${FILENAME}")/deltas"
# create the deltas directory if it doesn't exist
if [ ! -d "$DELTA_PATH" ]; then
    echo "INFO: creating directory $DELTA_PATH"
    mkdir -p "$DELTA_PATH"
fi

COMMITS=$(git log "--pretty=format:%H~%as" -- "$FILENAME" | tac)

PREVIOUS=""

for COMMIT in $COMMITS; do
    SHA=${COMMIT%%~*}
    DATE=${COMMIT##*~}
    echo "INFO: processing ${SHA:0:7} from $DATE"
    if [ "$PREVIOUS" == "" ]; then
        PREVIOUS=$SHA
        continue
    fi
    "${SCRIPT_HOME}/deltagen.sh" "$FILENAME" "$PREVIOUS" "$SHA" > "${DELTA_PATH}/${DATE}.txt"
    PREVIOUS=$SHA
done

