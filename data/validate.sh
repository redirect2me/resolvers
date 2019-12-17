#!/bin/bash
#
# validate the json
#
set -o errexit
set -o pipefail
set -o nounset


#LATER: check if ajv exists
#npm install -g ajv-cli

ajv validate -s schema.json -d "a*.json"