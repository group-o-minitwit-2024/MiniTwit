FROM node:slim

WORKDIR /express-docker

COPY package.json ./

RUN npm install

COPY . .

# Exposing server port
EXPOSE 5000

# Running npm run start on port 5000
CMD ["npm", "run", "start"]


