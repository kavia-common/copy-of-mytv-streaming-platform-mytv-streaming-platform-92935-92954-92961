# MyTV Workspace

- To start the frontend locally:
  - ./dev-start.sh

- Expected container workspaceFolder:
  - /workspace/copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961

- Frontend path:
  - /workspace/copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961/mytv_frontend

- Container start command (example):
  - cd mytv_frontend && HOST=${REACT_APP_HOST:-0.0.0.0} PORT=${REACT_APP_PORT:-3000} BROWSER=none CI=false npm start

- Healthcheck:
  - Path: use REACT_APP_HEALTHCHECK_PATH or default to /health (served via src/setupProxy.js).
  - Expected response: 200 OK with JSON body { status: "ok", service: "mytv_frontend", ... }.

If running in a container, ensure REACT_APP_* environment variables are provided (see mytv_frontend/.env.example to be created by orchestration).
