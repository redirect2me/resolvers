#!/usr/bin/env bash
#
# hack to work around the fact that botsin.space only supports 500 char toots
#

set -o errexit
set -o pipefail
set -o nounset

SCRIPT_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_HOME="$(realpath "${SCRIPT_HOME}/..")"

# check 2 or 3 params
if [ $# -ne 1 ]; then
    echo "Usage: $(basename $0) filename"
    echo "       truncates the file to 10 lines (if needed) and adds a comment"
    exit 1
fi

FILENAME=$1
LINES=$(wc -l < "$FILENAME")
if [ $LINES -gt 10 ]; then
    head -n 10 "$FILENAME"
    echo '...(truncated)'
else
    cat "$FILENAME"
fi
