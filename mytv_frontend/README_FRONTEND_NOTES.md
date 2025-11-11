# MyTV Frontend Notes

- Routes:
  - `/` Splash (auto-navigates to `/home` after a brief delay or via Enter button)
  - `/home` Home with fixed nav, hero banner, and horizontal rails
  - `/login` Simple email/password form with basic validation

- Tech:
  - React 18, React Router 6
  - Tailwind CSS (configured in tailwind.config.js and src/index.css)
  - Local data in `src/data/movies.js`, future API base envs are read if present.

- Theme:
  - Ocean Professional (blue and amber accents, dark content area, modern spacing + shadows)

## Mock Play API and troubleshooting "failed to fetch"

- The Title Detail "Play" button calls a mock API at: https://5bc9cfc0.api.kavia.app/api/play
- By default, if REACT_APP_API_BASE/REACT_APP_BACKEND_URL are not absolute HTTPS URLs, the app will use the mock API directly.
- If you see "failed to fetch":
  - Ensure the app is served over HTTPS to avoid mixed-content blocking when requesting HTTPS APIs.
  - Verify your REACT_APP_API_BASE is an absolute URL (e.g., https://api.example.com). Relative paths like "/api" are ignored for this call.
  - Check the browser Console/Network tab for CORS errors. The mock API sends permissive CORS headers.
  - You can copy .env.example to .env and set REACT_APP_API_BASE to your own absolute backend to override the mock.

## TV Remote Navigation (Samsung Tizen and Web Fallback)

- A TV-style focus manager and remote key handler are provided:
  - Focus context: `src/remote/focus/FocusContext.jsx`
    - use `useFocusable({ id, neighbors: { up, down, left, right }, onSelect, onBack, defaultFocused })` to make any element focusable.
    - Focused elements get a Tailwind ring: `ring-2 ring-amber-400`.
  - Global key handler: `src/remote/RemoteKeyHandler.jsx`
    - Handles ArrowUp/Down/Left/Right for navigation, Enter for select(), and Backspace/Escape/10009 for back.
  - Tizen key normalization: `src/remote/tizen-keys.js`
    - Translates KeyboardEvent into logical actions; maps Tizen back key `10009`.

- Pages integration:
  - Splash: Enter selects "Enter" and navigates to Home; Login link is focusable.
  - NavBar: Login link is focusable and Enter navigates to /login.
  - Home: Rails and cards are navigable horizontally; Up/Down moves between rails; Enter on a card shows a placeholder alert.
  - Login: Up/Down toggles between Email, Password, and Login button; Enter acts on the focused control. Back/Escape returns to Home if possible.

- Desktop keyboard testing mirrors TV keys:
  - Use Arrow keys to move focus, Enter to select, Escape/Backspace to go back.

### Tizen Deployment Pointers

- This app is a standard React SPA; to run on Samsung Tizen TV:
  1. Build: `npm run build`.
  2. Host via a simple static server or integrate into a Tizen web project (WGT) with the build output.
  3. Ensure remote keys are allowed; the handler listens to `keydown` events and maps Tizen back key (10009).
  4. `window.tizen` is checked only if available; behavior degrades gracefully on web.

No additional configuration is required for basic navigation.

## Samsung TV (Tizen) Packaging Quickstart

- Build the app: `npm run build`
- Use the provided `config.xml` at repo root and copy `mytv_frontend/build/*` + `config.xml` into a packaging folder so `index.html` is at the package root.
- Then run Tizen CLI:
  - `tizen build-web` (inside the packaging folder)
  - `tizen package -t wgt -s <your_cert_profile>`
  - Install on TV via: `sdb connect <TV_IP>:26101` and `sdb install <your>.wgt`
- Full steps: see `tizen/README_TIZEN.md`.
