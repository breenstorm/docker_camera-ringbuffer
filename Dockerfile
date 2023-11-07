FROM node
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
RUN npm install sharp
RUN npm install gif-encoder-2
ADD main.js main.js
EXPOSE 8000
ENTRYPOINT ["node","main.js"]
