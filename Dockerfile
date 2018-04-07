FROM node:8

# Create app directory
# RUN apt-get update && \
#     apt-get -y install curl

RUN mkdir -p /home/node/compiled && \
    mkdir -p /home/node/uploads && \
    mkdir -p /home/node/environment

ADD ./index.js /home/node/index.js

# Provides cached layer for node_modules
ADD ./package.json /tmp/package.json
RUN cd /tmp && npm install && \
    cp -a /tmp/node_modules /home/node

# Define working directory
WORKDIR /home/node

USER node

CMD ["./node_modules/.bin/nodemon", "-L", "--delay", "2", "--ext", "js", "--inspect=0.0.0.0:9229", "./index.js"]
