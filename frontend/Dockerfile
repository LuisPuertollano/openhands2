FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

# Set default API URL (can be overridden by docker-compose environment)
ENV REACT_APP_API_URL=http://localhost:45678/api
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
