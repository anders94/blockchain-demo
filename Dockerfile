FROM       node:alpine 

MAINTAINER https://github.com/anders94/blockchain-demo

EXPOSE     3000

WORKDIR    /blockchain-demo 

COPY       package.json /blockchain-demo

RUN        npm install

COPY       . /blockchain-demo 

CMD        ["bin/www"]
