#!/usr/bin/env sh
# PUBLIC_INTERFACE
# This script starts the CRA dev server with explicit host/port and safe defaults.
# It ensures predictable startup in container environments.

set -e

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3000}"
BROWSER="${BROWSER:-none}"

echo "Starting MyTV frontend on ${HOST}:${PORT} (BROWSER=${BROWSER})"
echo "Working directory: $(pwd)"

# Ensure the script is executable when run in container build steps that copy from host
# (No-op when already executable)
chmod +x "$0" 2>/dev/null || true

# Exec to replace shell with the node process
exec npm start
