# Use Node LTS
FROM node:18-alpine

# Set working directory to the correct project path inside the container
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --no-audit --fund=false

# Copy the rest of the app
COPY . .

# Expose the app port
EXPOSE 3000

# Environment defaults (can be overridden at runtime)
ENV HOST=0.0.0.0 \
    PORT=3000 \
    BROWSER=none

# Start the development server
CMD ["npm", "start"]
