#!/bin/sh
# Entrypoint para garantir que node_modules do host seja populado pelo container

npm install
npm run build
npm run prisma-generate

exec "$@"
