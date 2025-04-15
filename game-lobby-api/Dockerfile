# Use official Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose API port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start:dev"]
