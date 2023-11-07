FROM node
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ADD main.js main.js
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install
EXPOSE 8000
ENTRYPOINT ["node","main.js"]
