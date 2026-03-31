# Dockerfile para ambiente de desenvolvimento NestJS
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh && npm install

COPY . .

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
