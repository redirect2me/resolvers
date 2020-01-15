#!/bin/bash
#
# downloads a fresh copy of the MaxMind databases for ASN & geolocation lookups
#

set -o errexit
set -o pipefail
set -o nounset

echo "INFO: starting at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

ENV_FILE="../../.env"
if [ -f "${ENV_FILE}" ]; then
    echo "INFO: loading ${ENV_FILE} into environment"
    export $(CAT ${ENV_FILE})
fi

#
# check for required env vars
#
REQUIRED_VARS=( MAXMIND_LICENSE_KEY )
declare -a MISSING_VARS
for REQUIRED_VAR in "${REQUIRED_VARS[@]}"
do
    REQUIRED_VALUE="${!REQUIRED_VAR:-BAD}"
    if [ "${REQUIRED_VALUE}" = "BAD"  ]; then
		MISSING_VARS+=(${REQUIRED_VAR})
	fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "ERROR: missing env vars: ${MISSING_VARS[*]}"
    exit 3
fi

TMP_ASN_FILE=$(mktemp)
echo "INFO: download MaxMind ASN database into ${TMP_ASN_FILE}"
curl --silent "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN&suffix=tar.gz&license_key=${MAXMIND_LICENSE_KEY}" >"${TMP_ASN_FILE}"
tar -xzf ${TMP_ASN_FILE} --strip-components 1 "*.mmdb"
rm "${TMP_ASN_FILE}"

TMP_CITY_FILE=$(mktemp)
echo "INFO: download MaxMind City database into ${TMP_CITY_FILE}"
curl --silent "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&suffix=tar.gz&license_key=${MAXMIND_LICENSE_KEY}" >"${TMP_CITY_FILE}"
tar -xzf ${TMP_CITY_FILE} --strip-components 1 "*.mmdb"
rm "${TMP_CITY_FILE}"

if [ "${MMDB_ENCRYPTION_PASSWORD:-BAD}" = "BAD" ] || [ "${MMDB_ENCRYPTION_IV:-BAD}" == "BAD" ]; then
    echo "INFO: no encryption keys, exiting.  (but app can still be run locally)"
    exit 1
fi

ASN_FILE=GeoLite2-ASN.mmdb
echo "INFO: starting encryption of ${ASN_FILE} (file size=$(du ${ASN_FILE} | cut -f 1))"
gzip --stdout ${ASN_FILE} | openssl enc -aes-256-ctr \
	-K ${MMDB_ENCRYPTION_PASSWORD} \
	-iv ${MMDB_ENCRYPTION_IV} \
	-out ${ASN_FILE}.enc
rm ${ASN_FILE}
echo "INFO: encryption complete (file size=$(du ${ASN_FILE}.enc | cut -f 1))"

CITY_FILE=GeoLite2-City.mmdb
echo "INFO: starting encryption of ${CITY_FILE} (file size=$(du ${CITY_FILE} | cut -f 1))"
gzip --stdout ${CITY_FILE} | openssl enc -aes-256-ctr \
	-K ${MMDB_ENCRYPTION_PASSWORD} \
	-iv ${MMDB_ENCRYPTION_IV} \
	-out ${CITY_FILE}.enc
rm ${CITY_FILE}
echo "INFO: encryption complete (file size=$(du ${CITY_FILE}.enc | cut -f 1))"

echo "INFO: complete at $(date -u +%Y-%m-%dT%H:%M:%SZ)"