# Dockerfile para ambiente de desenvolvimento Vite React
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh && npm install

COPY . .

EXPOSE 5173
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
