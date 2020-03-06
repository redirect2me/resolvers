#/usr/bin/env bash
#
# download the list of TLDs from ICANN
#
echo "INFO: starting ICANN update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

TARGET_DIR="$(dirname "$0")/icann"
echo "INFO: target directory is ${TARGET_DIR}"

URL="https://data.iana.org/TLD/tlds-alpha-by-domain.txt"

curl "${URL}" >${TARGET_DIR}/tlds-alpha-by-domain.txt

echo "INFO: complete ICANN update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
