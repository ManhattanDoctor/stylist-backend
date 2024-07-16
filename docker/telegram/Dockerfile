FROM node:18
WORKDIR /application

# Copy global node_modules
COPY ../../node_modules /application/node_modules
# Copy local node_modules
COPY ../../src/packages/application/telegram/node_modules /application/build/node_modules
# Copy compiled node_modules
COPY ../../src/packages/application/telegram/build/node_modules /application/build/node_modules
# Copy compiles files to working directory
COPY ../../src/packages/application/telegram/build/src/packages/application/telegram /application/build
# Copy locale file
COPY ../../locale /application/build/locale
# Copy env file
COPY ../../docker/telegram/.env /application/build

# Set directory
WORKDIR /application/build
CMD node main.js
