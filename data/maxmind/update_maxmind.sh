#!/usr/bin/env bash
#
# downloads a fresh copy of the MaxMind databases for ASN & geolocation lookups
#
bash --version

set -o errexit
set -o pipefail
set -o nounset

echo "INFO: starting MaxMind update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

ENV_FILE=".env"
if [ -f "${ENV_FILE}" ]; then
    echo "INFO: loading ${ENV_FILE} into environment"
    export $(cat ${ENV_FILE})
fi

TARGET_DIR=$(dirname "$0")
echo "INFO: creating files in ${TARGET_DIR}"

TMP_ASN_FILE=$(mktemp)
echo "INFO: download MaxMind ASN database into ${TMP_ASN_FILE}"
curl --silent "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN&suffix=tar.gz&license_key=${MAXMIND_LICENSE_KEY}" >"${TMP_ASN_FILE}"
tar -xzf ${TMP_ASN_FILE} --directory="${TARGET_DIR}" --wildcards --strip-components 1 "*.mmdb"
rm "${TMP_ASN_FILE}"

TMP_CITY_FILE=$(mktemp)
echo "INFO: download MaxMind City database into ${TMP_CITY_FILE}"
curl --silent "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&suffix=tar.gz&license_key=${MAXMIND_LICENSE_KEY}" >"${TMP_CITY_FILE}"
tar -xzf ${TMP_CITY_FILE} --directory="${TARGET_DIR}" --wildcards --strip-components 1 "*.mmdb"
rm "${TMP_CITY_FILE}"

if [ "${MMDB_ENCRYPTION_KEY:-BAD}" = "BAD" ]; then
    echo "INFO: no encryption keys, exiting.  (but app can still be run locally)"
    exit 1
fi

md5sum ${TARGET_DIR}/*.mmdb | sort >${TARGET_DIR}/mmdb.md5

DIFF=$(git diff --name-only "${TARGET_DIR}/mmdb.md5")

if [ "${DIFF}" == "" ]; then
    echo "INFO: no substantive changes, exiting at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    rm ${TARGET_DIR}/*.mmdb
    exit 0
fi

#
# generate (and save) a new IV every time
#
MMDB_ENCRYPTION_IV=$(head -c 4096 /dev/urandom | LC_CTYPE=C tr -dc A-F0-9 | head -c 32)
echo -n ${MMDB_ENCRYPTION_IV} > ${TARGET_DIR}/mmdb.iv

ASN_FILE=${TARGET_DIR}/GeoLite2-ASN.mmdb
echo "INFO: starting encryption of ${ASN_FILE} (file size=$(du ${ASN_FILE} | cut -f 1))"
gzip --stdout ${ASN_FILE} | openssl enc -aes-256-ctr \
	-K ${MMDB_ENCRYPTION_KEY} \
	-iv ${MMDB_ENCRYPTION_IV} \
	-out ${ASN_FILE}.enc
rm ${ASN_FILE}
echo "INFO: encryption complete (file size=$(du ${ASN_FILE}.enc | cut -f 1))"

CITY_FILE=${TARGET_DIR}/GeoLite2-City.mmdb
echo "INFO: starting encryption of ${CITY_FILE} (file size=$(du ${CITY_FILE} | cut -f 1))"
gzip --stdout ${CITY_FILE} | openssl enc -aes-256-ctr \
	-K ${MMDB_ENCRYPTION_KEY} \
	-iv ${MMDB_ENCRYPTION_IV} \
	-out ${CITY_FILE}.enc
rm ${CITY_FILE}
echo "INFO: encryption complete (file size=$(du ${CITY_FILE}.enc | cut -f 1))"

echo "INFO: complete MaxMind update at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
