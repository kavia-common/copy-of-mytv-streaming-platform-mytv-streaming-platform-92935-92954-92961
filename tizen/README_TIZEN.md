# Tizen (Samsung TV) Packaging Guide

This project supports building a Samsung TV Web app package (WGT) using the Tizen Studio CLI.

## Prerequisites

- Install Tizen Studio + CLI tools:
  - https://developer.tizen.org/development/tizen-studio/download
- Install Samsung TV Extensions in Tizen Studio (for TV profile).
- Ensure `tizen` and `sdb` commands are in your PATH.
- Configure a Samsung TV device for Developer Mode (enable Dev Mode in TV, get IP).

## Build the React app

From the frontend folder:

```bash
cd ../mytv_frontend
npm install
npm run build
```

This generates `mytv_frontend/build/`.

## Prepare package content

You have two options:

1) Place index.html at package root (recommended for simple packaging)
- Copy build output to a new folder that will be packaged and ensure index.html is at the root:
  ```bash
  mkdir -p ../tizen/dist
  cp -r build/* ../tizen/dist/
  # Ensure config.xml is located at the root of the package content
  cp ../config.xml ../tizen/dist/
  ```

2) Keep CRA build structure and adjust content src
- If you want to retain `build/index.html` inside a subfolder, change `<content src="index.html"/>` to `<content src="build/index.html"/>` in `config.xml`.
- Then copy `config.xml` alongside the `build/` folder into the package content directory.

Note: The provided `config.xml` assumes `index.html` is at the package root; follow Option 1 unless you customize.

## Create a Tizen Web project folder (optional)

If you prefer wrapping into a Tizen project structure (optional step):

```bash
cd ../tizen
tizen create web-project -n mytv-tv -p tv
# Replace the generated project content with our dist:
rm -rf mytv-tv/*
cp -r dist/* mytv-tv/
```

You can also skip this and build directly from the `dist` folder using `tizen build-web -s`.

## Build and package (WGT)

Using the `dist` directory that contains `index.html` and `config.xml`:

```bash
cd ../tizen

# Build web (generates .wgt in ./.buildResult)
tizen build-web -- . /home/kavia/workspace/code-generation/mytv-streaming-platform-92935-92954/tizen/dist

# Alternatively, change into dist and build from there:
cd dist
tizen build-web
tizen package -t wgt
```

If `tizen build-web` creates a `.buildResult` folder, then:

```bash
# Package the build result into WGT
tizen package -t wgt -s <your_cert_profile_name> -o .
```

If you don't have a Samsung certificate profile yet, create one with Tizen Studio Certificate Manager and note its name.

The resulting `.wgt` file will be in the output directory.

## Connect to TV and install

1. Discover or set TV IP, ensure PC and TV are on the same network.
2. Connect via SDB:
   ```bash
   sdb devices
   sdb connect <TV_IP>:26101
   sdb devices
   ```
3. Install the WGT:
   ```bash
   sdb install <path-to-wgt-file>
   ```
4. Launch from the TV Apps screen (Developer section) or via:
   ```bash
   # If you know the appId, you can attempt:
   sdb shell 0 applist
   sdb shell 0 app_launcher -s <app_id>
   ```

## Notes

- Remote keys are handled by the app's RemoteKeyHandler; Back key (10009) and arrows work out-of-the-box.
- Privileges: Only internet is required (`http://tizen.org/privilege/internet`).
- Profile: `tv` with required_version >= 4.0.
- Screen orientation is fixed to landscape for TV.
- If your build serves assets from relative paths, ensure paths remain valid with index.html at package root.
- Environment variables used at build-time (CRA-style `REACT_APP_*`) are baked into the build. For runtime configuration, you may need additional logic (not covered here).

## Troubleshooting

- If the TV doesn’t show the app, check that Dev Mode is enabled and the TV is connected via `sdb`.
- If packaging fails due to certificates, create/import a Samsung certificate profile in Tizen Studio and specify with `-s <profile>`.
- If you keep `index.html` inside `build/`, ensure `<content src="build/index.html" />` in `config.xml`.
