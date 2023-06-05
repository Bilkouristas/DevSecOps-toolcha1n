# Dockerfile for client

# Stage 1: Build react client
FROM node:14.15.1-alpine

# Working directory be app
WORKDIR /usr/src/app/react-app

COPY package*.json ./

# Install dependencies
RUN npm i

# copy local files to app folder
COPY . .

EXPOSE 3000

CMD ["npm","start"]