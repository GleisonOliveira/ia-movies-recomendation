#!/bin/sh
# Entrypoint para garantir que node_modules do host seja populado pelo container

npm install

exec "$@"
