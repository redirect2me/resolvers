#!/usr/bin/env bash
#
# uses the Mozilla public suffix list (https://publicsuffix.org/list/public_suffix_list.dat) to generate a list of TLDs to check for domain availability
#

set -o errexit
set -o pipefail
set -o nounset

curl https://publicsuffix.org/list/public_suffix_list.dat \
    | grep -v '\.' \
    | grep -e "^[a-z]" \
    | jq --raw-input --slurp 'split("\n") | map(select(. != ""))'  \
    >../data/tld.json
