# Orchestrator Integration Notes

Use the repo-relative script to start the frontend without hard-coded absolute paths:

- Start script: .init/dev-start-frontend.sh
- Working directory: resolved dynamically to <repo-root>/mytv_frontend
- Env: respects REACT_APP_* vars, PORT defaults to 3000, binds to HOST=0.0.0.0

Ensure any orchestrator config uses a relative workingDirectory (e.g., mytv_frontend) rather than absolute host paths like:
- /home/kavia/workspace/code-generation/mytv-streaming-platform-92935-92954/mytv_frontend

Updated canonical path to this workspace:
- /home/kavia/workspace/code-generation/copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961/mytv_frontend
