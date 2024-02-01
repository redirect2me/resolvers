#!/usr/bin/env bash
#
# diff a file between two commits, ignoring moves and comments
#

set -o errexit
set -o pipefail
set -o nounset

SCRIPT_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_HOME="$( cd "${SCRIPT_HOME}/.." && pwd )"

# check 2 or 3 params
if [ $# -ne 2 ] && [ $# -ne 3 ]; then
    echo "Usage: $0 filename commit1 [commit2]"
    exit 1
fi

FILENAME=$1
COMMIT1=$2

BEFORE=$(git show $2:$1 | egrep -v "^(//|#)" | egrep -v "^$" | sort)
if [ $# -eq 2 ]; then
    AFTER=$(cat "${REPO_HOME}/${FILENAME}" | egrep -v "^(//|#)" | egrep -v "^$" | sort)
else
    COMMIT2=${3}
    AFTER=$(git show $3:$1 | egrep -v "^(//|#)" | egrep -v "^$" | sort)
fi

set +o errexit
diff \
    --unified=0 \
    <(echo "$BEFORE") <(echo "$AFTER") \
    | egrep -v "^(\+\+\+|---|@@)"

exit 0