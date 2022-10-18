FROM node:latest
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
RUN npm run bootstrap
RUN npm run build
