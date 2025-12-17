FROM node:18-alpine

# Install PostgreSQL client for database operations
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
