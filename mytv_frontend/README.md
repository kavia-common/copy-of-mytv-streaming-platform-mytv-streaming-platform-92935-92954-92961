# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Container Runtime Notes (Working Directory and Paths)

- The Dockerfile uses `WORKDIR /usr/src/app`.
- docker-compose mounts the project directory using:
  - `volumes: - ./mytv_frontend:/usr/src/app`
  - `working_dir: /usr/src/app`
- Important: Do not reference host paths inside the container. For example, paths like `/home/kavia/workspace/code-generation/.../mytv_frontend` should never be used as `WORKDIR` or `command` working paths inside the container.
- If you encounter a startup error such as "chdir: no such file or directory", verify:
  1) The compose `build.context` is `./mytv_frontend` from the repository root.
  2) The compose `working_dir` is `/usr/src/app`.
  3) The volume mount maps `./mytv_frontend:/usr/src/app`.
  4) The container command is `["npm", "start"]`.

### Example docker-compose service (already configured in the repo)

Important: Run docker-compose from the repository root:
- Base directory: /home/kavia/workspace/code-generation
- Project workspace: copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961

From the base directory:
```bash
cd /home/kavia/workspace/code-generation/copy-of-mytv-streaming-platform-mytv-streaming-platform-92935-92954-92961
docker compose up --build mytv_frontend
```

Do not use older paths like `/home/kavia/workspace/code-generation/mytv-streaming-platform-92935-92954/...` as they no longer exist in this workspace.

```yaml
services:
  mytv_frontend:
    build:
      context: ./mytv_frontend
      dockerfile: Dockerfile
    working_dir: /usr/src/app
    volumes:
      - ./mytv_frontend:/usr/src/app
    environment:
      HOST: 0.0.0.0
      PORT: 3000
      BROWSER: none
    ports:
      - "3000:3000"
    command: ["npm", "start"]
```


## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
