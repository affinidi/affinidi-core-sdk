FROM node:latest
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
#link and install all dependencies;
RUN npm run bootstrap
#build all projects in this monorepo
RUN npm run build
