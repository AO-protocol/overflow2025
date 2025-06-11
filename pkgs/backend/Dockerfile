# Use Node.js 20 as the base image with platform specification
FROM --platform=linux/amd64 node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install 

# Install @types/node for TypeScript compilation
RUN pnpm add -D @types/node

# Copy the rest of the code
COPY . .

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 4021

# Command to run the application
CMD ["node", "--experimental-modules", "--es-module-specifier-resolution=node", "./dist/index.js"]
