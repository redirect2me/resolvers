#!/bin/bash
#
# reformat the json files
#

set -o errexit
set -o pipefail
set -o nounset

for FILE in *.json; do
	echo "INFO: processing ${FILE}"
	cat ${FILE} | jq . --sort-keys | ex -sc "wq!${FILE}" /dev/stdin
done
echo "INFO: complete!"
