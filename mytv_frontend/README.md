# MyTV Frontend

This is the React frontend for the MyTV streaming interface. It uses Create React App with React Router and Tailwind CSS for styling.

## Features
- Splash screen, Home page with rails, and Login page
- Responsive design with modern, minimal styling
- Local mock data with future backend integration

## Getting Started

In the mytv_frontend directory, you can run:

### npm start
Runs the app in development mode.
- Open http://localhost:3000 to view it in your browser.
- You can change the port by setting REACT_APP_PORT or PORT, for example:
  - PORT=3000 npm start
  - REACT_APP_PORT=3000 npm start

### npm test
Launches the test runner in interactive watch mode.

### npm run build
Builds the app for production to the build folder.

## Running from the workspace root

From the workspace root directory:
- ./dev-start.sh

This script ensures the correct working directory is used:
- Frontend path: ./mytv_frontend
- It installs dependencies if needed and starts the app on PORT (defaults to 3000).

## Container usage

Ensure your container uses the correct working paths:
- workspaceFolder (root): /workspace/copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961
- frontend path: /workspace/copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961/mytv_frontend
- start command: cd mytv_frontend && PORT=${REACT_APP_PORT:-3000} CI=false npm start

If you are using VS Code Dev Containers, the .devcontainer/devcontainer.json is configured to:
- Set the workspaceFolder correctly
- Install dependencies and start the app from mytv_frontend

## Environment variables

The app reads the following environment variables (expected to be provided by orchestrator or .env handling):
- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- REACT_APP_FRONTEND_URL
- REACT_APP_WS_URL
- REACT_APP_NODE_ENV
- REACT_APP_NEXT_TELEMETRY_DISABLED
- REACT_APP_ENABLE_SOURCE_MAPS
- REACT_APP_PORT
- REACT_APP_TRUST_PROXY
- REACT_APP_LOG_LEVEL
- REACT_APP_HEALTHCHECK_PATH
- REACT_APP_FEATURE_FLAGS
- REACT_APP_EXPERIMENTS_ENABLED

Note: Do not commit secrets. Use environment variables injected by your orchestration.

## Customization

Main brand colors can be customized in Tailwind and CSS files (e.g., src/App.css, tailwind.config.js). Tailwind is installed as a dev dependency.

## Learn More

- React: https://reactjs.org/
- Create React App docs: https://create-react-app.dev/
- React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/
