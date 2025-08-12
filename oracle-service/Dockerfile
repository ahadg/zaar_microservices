FROM node:20

WORKDIR /app
COPY package*.json ./

RUN npm install -g nodemon && npm install

COPY . .

EXPOSE 3003

# Use nodemon for auto reload
CMD ["nodemon", "--legacy-watch", "app.js"]
