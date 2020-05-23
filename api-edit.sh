#!/usr/bin/env bash
#
# edit swagger api spec
#

#docker pull swaggerapi/swagger-editor

docker run -d -p 4000:8080 -e URL=/resolvers/swagger.json -v "$(pwd)/data/api:/usr/share/nginx/html/resolvers" swaggerapi/swagger-editor
