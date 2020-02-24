#/usr/bin/env bash
#
# download the list of TLDs from ICANN
#

URL="https://data.iana.org/TLD/tlds-alpha-by-domain.txt"

curl "${URL}" >icann/tlds-alpha-by-domain.txt