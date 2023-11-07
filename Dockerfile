FROM node
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
RUN npm install
ADD main.js main.js
EXPOSE 8000
ENTRYPOINT ["node","main.js"]
