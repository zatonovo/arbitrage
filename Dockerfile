# Dockerfile for testing the module
FROM node:9.80-stretch
MAINTAINER Brian Lee Yung Rowe "rowe@zatonovo.com"

RUN npm install ava@next --save-dev && npx ava --init
CMD ["ava test"]
