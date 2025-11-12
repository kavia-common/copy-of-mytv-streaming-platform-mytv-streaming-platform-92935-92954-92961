#!/usr/bin/env bash
# PUBLIC_INTERFACE
# This script starts the mytv_frontend React application ensuring the correct working directory.
# It respects REACT_APP_* env vars provided by the environment.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
FRONTEND_DIR="${PROJECT_ROOT}/mytv_frontend"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "Error: Frontend directory not found at ${FRONTEND_DIR}" >&2
  exit 127
fi

cd "$FRONTEND_DIR"
echo "Resolved FRONTEND_DIR: $(pwd)"

# Install dependencies if node_modules missing
if [[ ! -d "node_modules" ]]; then
  echo "Installing dependencies..."
  if command -v npm >/dev/null 2>&1; then
    npm ci || npm install
  else
    echo "Error: npm not found in PATH." >&2
    exit 127
  fi
fi

# Default host/port and disable auto-opening browser for CI/containers
PORT="${REACT_APP_PORT:-${PORT:-3000}}"
HOST="${REACT_APP_HOST:-${HOST:-0.0.0.0}}"
export PORT HOST BROWSER=none

echo "Starting mytv_frontend in $(pwd) on ${HOST}:${PORT} ..."
# Explicitly set env for CRA to ensure proper binding
HOST="$HOST" PORT="$PORT" BROWSER="none" CI=false npm start
