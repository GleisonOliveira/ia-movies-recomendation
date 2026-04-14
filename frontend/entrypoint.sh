#!/bin/sh
# Entrypoint para garantir que as dependencias sejam instaladas no container

npm install

exec "$@"
