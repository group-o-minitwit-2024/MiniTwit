FROM node:slim

WORKDIR /express-docker

COPY . .

RUN npm install

# Exposing server port
EXPOSE 5000

CMD ["node", "app.js"]

