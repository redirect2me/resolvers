#!/bin/bash
#
# run server locally
#

export $(cat .env)

npx nodemon
