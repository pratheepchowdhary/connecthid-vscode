# ConnectHID AOSP Build for VS Code

Simplify and automate your AOSP (Android Open Source Project) development workflow directly within VS Code. This extension provides a specialized Run Configuration system similar to Android Studio, optimized for both local and remote development.

## Features

- **AOSP Run Configurations**: Create and manage multiple build setups in a dedicated sidebar view.
- **Interactive Setup Wizard**:
  - Automatically fetches `lunch` targets from your AOSP root.
  - Supports selection of Build Variants (`user`, `userdebug`, `eng`).
  - Integrated Device Selection via ADB.
- **Integrated Build Tasks**:
  - Native VS Code Task Provider for AOSP.
  - Automatically handles `source build/envsetup.sh` and `lunch`.
  - Supports Clean, Incremental, and Full builds.
- **Remote-SSH Native Support**:
  - Build on a high-performance remote server while debugging on local devices.
  - Built-in **ADB Tunneling Guide** for port forwarding (5037).
  - Configurable `connecthid.adbHost` for split-environment setups.

## Requirements

- **AOSP Source**: A local or remote AOSP root directory.
- **ADB**: `adb` command-line tool installed on the machine where devices are connected.
- **Remote-SSH (Optional)**: VS Code Remote-SSH extension if building on a remote server.

## Usage

1. **Add Configuration**: Click the `+` icon in the **ConnectHID AOSP** sidebar or run the command `ConnectHID: Add AOSP Configuration`.
2. **Setup**: Follow the prompts to select your AOSP root, lunch target, and variant.
3. **ADB Tunneling (Remote Only)**: If building remotely, use the "Ports" view in VS Code to forward port `5037` from local to remote.
4. **Build**: Click the play icon next to your configuration to trigger the build task.

## Configuration

- `connecthid.adbHost`: The host where the ADB server is running (default: `127.0.0.1`).

## License

MIT