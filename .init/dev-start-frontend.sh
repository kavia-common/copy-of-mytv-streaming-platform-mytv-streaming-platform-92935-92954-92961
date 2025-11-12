#!/usr/bin/env bash
# PUBLIC_INTERFACE
# Purpose: Start the mytv_frontend dev server from the repository root without hard-coded absolute paths.
# - Ensures correct working directory
# - Installs dependencies if missing
# - Exposes port configured by REACT_APP_PORT (defaults 3000) and binds to 0.0.0.0 for container access
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/mytv_frontend"

if [[ ! -d "${FRONTEND_DIR}" ]]; then
  echo "Error: Frontend directory not found at ${FRONTEND_DIR}" >&2
  exit 127
fi

cd "${FRONTEND_DIR}"
echo "Working directory: $(pwd)"

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  if command -v npm >/dev/null 2>&1; then
    npm ci || npm install
  else
    echo "Error: npm not found." >&2
    exit 127
  fi
fi

export HOST="${HOST:-0.0.0.0}"
export PORT="${REACT_APP_PORT:-3000}"

echo "Starting dev server on ${HOST}:${PORT}..."
CI=false npm start
