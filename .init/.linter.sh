#!/bin/bash
# Ensure we run the build from the correct mytv_frontend directory in this workspace
set -euo pipefail

cd /home/kavia/workspace/code-generation/copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961/mytv_frontend

# Use CI=true to enforce lint as errors in CI
CI=true npm run build

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit $EXIT_CODE
fi

