# Dockerfile para ambiente de desenvolvimento NestJS
# Observação: `@tensorflow/tfjs-node` usa binários nativos.
# Evitamos `node:* -alpine` (musl) para reduzir falhas de compatibilidade.
FROM node:22-slim

WORKDIR /usr/src/app

COPY package*.json ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh \
  && apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install

COPY . .

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
