#!/bin/bash
cd /home/kavia/workspace/code-generation/mytv-streaming-platform-92935-92954/mytv_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

