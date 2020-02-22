#!/bin/bash
#
# make the encryption key for the mmdb files since we are not allowed to distribute them as-is
#
# usage:
#   make_key.sh >>../../.env
#
# you also need to add them to the env whereever you are running the node app
#

echo "MMDB_ENCRYPTION_KEY=$(head -c 4096 /dev/urandom | LC_CTYPE=C tr -dc A-F0-9 | head -c 64)"
