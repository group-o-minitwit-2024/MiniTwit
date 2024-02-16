FROM node:slim

WORKDIR /express-docker

COPY . .

RUN npm install

CMD ["node", "app.js"]

# Exposing server port
EXPOSE 5000
