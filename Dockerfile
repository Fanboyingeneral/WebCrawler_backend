FROM node:16-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .

# Default port set via ENV, can be overridden at runtime
ENV BACKEND_PORT 7100

EXPOSE ${PORT}

CMD ["sh", "-c", "node index.js --port=${BACKEND_PORT}"]
