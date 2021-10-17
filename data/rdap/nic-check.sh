#!/usr/bin/env bash


CCTLDS=( $(cat cctlds.txt) )
for CCTLD in ${CCTLDS[@]}
do
  RESULTS=$(dig +short rdap.nic.${CCTLD})

  >&2 echo "${CCTLD}: ${RESULTS}"

  if [ ! -z "${RESULTS}" ];
  then
    echo "  \"${CCTLD}\": \"https://rdap.nic.${CCTLD}/\","
  fi
done