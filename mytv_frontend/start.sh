#!/usr/bin/env sh
# PUBLIC_INTERFACE
# This script starts the CRA dev server with explicit host/port and safe defaults.
# It ensures predictable startup in container environments and prints diagnostics.
#
# Env respected by CRA:
# - HOST: bind address (0.0.0.0 inside containers)
# - PORT: port to listen on (3000 default)
# - BROWSER: 'none' to avoid opening a browser in CI/containers

set -eu

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3000}"
BROWSER="${BROWSER:-none}"

export HOST PORT BROWSER

echo "Starting MyTV frontend on ${HOST}:${PORT} (BROWSER=${BROWSER})"
echo "Node version: $(node -v 2>/dev/null || echo 'unknown')"
echo "NPM version: $(npm -v 2>/dev/null || echo 'unknown')"
echo "Working directory: $(pwd)"
echo "Checking react-scripts availability..."
if ! npx --no-install react-scripts --version >/dev/null 2>&1; then
  echo "react-scripts not found in node_modules. Installing dependencies..."
  npm install --no-audit --fund=false || npm ci --no-audit --fund=false || true
fi

# Print which port is set inside React env for visibility
echo "Environment: HOST=${HOST} PORT=${PORT} BROWSER=${BROWSER}"
# Start CRA dev server
exec npx react-scripts start
