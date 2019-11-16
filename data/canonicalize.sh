#!/bin/bash


for FILE in *.json; do
	cat ${FILE} | jq . --sort-keys | ex -sc "wq!${FILE}" /dev/stdin 
done
