# Use Node LTS
FROM node:18-alpine

# Set working directory to the correct project path inside the container
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies (use npm ci if lockfile exists, otherwise fallback to npm install)
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --fund=false; \
    else \
      npm install --no-audit --fund=false; \
    fi

# Copy the rest of the app
COPY . .

# Ensure start.sh is executable
RUN chmod +x /usr/src/app/start.sh || true

# Expose the app port
EXPOSE 3000

# Environment defaults (can be overridden at runtime)
ENV HOST=0.0.0.0 \
    PORT=3000 \
    BROWSER=none \
    REACT_APP_HEALTHCHECK_PATH=/healthcheck.html

# Start the development server via start.sh (ensures HOST/PORT are honored)
CMD ["./start.sh"]
