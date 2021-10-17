#!/usr/bin/env bash


CCTLDS=( $(cat cctlds.txt) )
for CCTLD in ${CCTLDS[@]}
do
  WHOIS=$(whois -h whois.iana.org .${CCTLD} | egrep -e '^whois:' | sed -e 's/[[:space:]][[:space:]]*/ /g' | cut -d " " -f 2)

  if [ -z "${WHOIS}" ];
  then
    #>&2 echo "${CCTLD}: no whois server"
    continue
  fi


  if [[ ! $WHOIS =~ ^whois.* ]];
  then
    >&2 echo "${CCTLD}: unusual whois (${WHOIS})"
    continue
  fi

  BASE=${WHOIS#whois.}
  RDAP=rdap.${BASE}

  if [ "${RDAP}" == "rdap.nic.${CCTLD}" ];
  then
    #>&2 echo "${CCTLD}: already tried via nic-check.sh"
    continue
  fi

  RESULTS=$(dig +short ${RDAP})

  if [ ! -z "${RESULTS}" ];
  then
    #>&2 echo "${CCTLD}: ${RDAP} found!!!"
    echo "  \"${CCTLD}\": \"https://${RDAP}/\","
  #else
    #>&2 echo "${CCTLD}: ${RDAP} does not resolve"
  fi
done