# Deep Linking Quick Start Guide

## Quick Testing Commands

### iOS Simulator

```bash
# Test custom URL scheme
xcrun simctl openurl booted "urbanexplorer://location/123"
xcrun simctl openurl booted "urbanexplorer://profile/johndoe"
xcrun simctl openurl booted "urbanexplorer://review/456"

# Test universal links (requires server setup)
xcrun simctl openurl booted "https://urbanexplorer.app/location/123"
xcrun simctl openurl booted "https://urbanexplorer.app/profile/johndoe"
xcrun simctl openurl booted "https://urbanexplorer.app/review/456"
```

### Android Emulator

```bash
# Test custom URL scheme
adb shell am start -W -a android.intent.action.VIEW -d "urbanexplorer://location/123" app.urbanexplorer
adb shell am start -W -a android.intent.action.VIEW -d "urbanexplorer://profile/johndoe" app.urbanexplorer
adb shell am start -W -a android.intent.action.VIEW -d "urbanexplorer://review/456" app.urbanexplorer

# Test App Links (requires server setup)
adb shell am start -W -a android.intent.action.VIEW -d "https://urbanexplorer.app/location/123" app.urbanexplorer
adb shell am start -W -a android.intent.action.VIEW -d "https://urbanexplorer.app/profile/johndoe" app.urbanexplorer
adb shell am start -W -a android.intent.action.VIEW -d "https://urbanexplorer.app/review/456" app.urbanexplorer
```

## Required Server Configuration

### For iOS Universal Links

Upload `apple-app-site-association` (no extension) to:
```
https://urbanexplorer.app/.well-known/apple-app-site-association
https://www.urbanexplorer.app/.well-known/apple-app-site-association
```

**Before uploading:**
1. Replace `TEAM_ID` with your Apple Team ID
2. Ensure HTTPS, no redirects
3. Content-Type: `application/json`

### For Android App Links

Upload `assetlinks.json` to:
```
https://urbanexplorer.app/.well-known/assetlinks.json
https://www.urbanexplorer.app/.well-known/assetlinks.json
```

**Before uploading:**
1. Generate SHA-256 fingerprint:
   ```bash
   # Debug
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

   # Release
   keytool -list -v -keystore /path/to/release.keystore -alias your_alias
   ```

2. Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` in the file
3. Ensure HTTPS, no redirects
4. Content-Type: `application/json`

## iOS Xcode Configuration

1. Open Xcode: `npx cap open ios`
2. Select app target > Signing & Capabilities
3. Add "Associated Domains" capability
4. Add domains:
   - `applinks:urbanexplorer.app`
   - `applinks:www.urbanexplorer.app`

## Verification

### iOS
```bash
# Verify association file
curl -I https://urbanexplorer.app/.well-known/apple-app-site-association

# Use Apple's validator
# https://search.developer.apple.com/appsearch-validation-tool/
```

### Android
```bash
# Verify association file
curl https://urbanexplorer.app/.well-known/assetlinks.json

# Check verification status
adb shell pm get-app-links app.urbanexplorer

# View detailed info
adb shell dumpsys package domain-preferred-apps

# Use Google's validator
# https://developers.google.com/digital-asset-links/tools/generator
```

## Build & Deploy

```bash
# Build web assets
npm run build

# Sync with native projects
npx cap sync

# Open in IDEs
npx cap open ios
npx cap open android
```

## Supported Deep Link Patterns

| Pattern | Example | Navigates To |
|---------|---------|--------------|
| `urbanexplorer://location/{id}` | `urbanexplorer://location/123` | Location detail page |
| `urbanexplorer://profile/{username}` | `urbanexplorer://profile/johndoe` | User profile page |
| `urbanexplorer://review/{id}` | `urbanexplorer://review/456` | Review detail page |
| `https://urbanexplorer.app/location/{id}` | `https://urbanexplorer.app/location/123` | Location detail page |
| `https://urbanexplorer.app/profile/{username}` | `https://urbanexplorer.app/profile/johndoe` | User profile page |
| `https://urbanexplorer.app/review/{id}` | `https://urbanexplorer.app/review/456` | Review detail page |

## Troubleshooting

### Deep links not working?

1. **Check app is installed and running**
2. **Custom scheme (urbanexplorer://) should work immediately**
3. **Universal/App Links require:**
   - Association files deployed to server
   - Domain verification complete (may take 24h for iOS)
   - App reinstalled after server configuration

### iOS specific
- Check Associated Domains in Xcode capabilities
- Verify Team ID in `apple-app-site-association`
- Long-press link and select "Open in App"

### Android specific
- Verify SHA-256 fingerprint matches
- Check `adb shell pm get-app-links app.urbanexplorer`
- Uninstall and reinstall app

## For Full Documentation

See [DEEP_LINKING_SETUP.md](./DEEP_LINKING_SETUP.md) for complete setup instructions, debugging tips, and advanced configuration.
