FROM node:18-alpine

# Install PostgreSQL client for database operations
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the entrypoint script first and make it executable
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Copy the rest of the application
COPY . .

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
