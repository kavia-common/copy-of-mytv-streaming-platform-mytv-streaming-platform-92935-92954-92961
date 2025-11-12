#!/bin/bash
# Ensure we cd into the correct project path before building the frontend.
# This path corresponds to the actual workspace folder for this repository.
set -euo pipefail

cd /home/kavia/workspace/code-generation/copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961/mytv_frontend

# Use npm ci if node_modules does not exist to avoid build failures due to missing deps.
if [ ! -d "node_modules" ]; then
  npm ci || npm install
fi

npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

