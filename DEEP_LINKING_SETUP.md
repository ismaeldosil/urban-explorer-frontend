# Deep Linking Setup for Urban Explorer

This document provides instructions for configuring and testing deep linking in the Urban Explorer mobile app.

## Overview

Deep linking allows users to open specific content in the app directly from external links. The app supports:
- Custom URL scheme: `urbanexplorer://`
- Universal Links (iOS): `https://urbanexplorer.app`
- App Links (Android): `https://urbanexplorer.app`

## Supported Deep Link Patterns

1. **Location Detail**: `urbanexplorer://location/{id}` or `https://urbanexplorer.app/location/{id}`
2. **User Profile**: `urbanexplorer://profile/{username}` or `https://urbanexplorer.app/profile/{username}`
3. **Review**: `urbanexplorer://review/{id}` or `https://urbanexplorer.app/review/{id}`

## Files Created/Modified

### Core Service
- **`/src/app/infrastructure/services/deep-link.service.ts`** - Main service handling deep link navigation
- **`/src/app/infrastructure/services/index.ts`** - Updated to export DeepLinkService

### App Configuration
- **`/capacitor.config.ts`** - Added App plugin configuration
- **`/src/app/app.component.ts`** - Initialized DeepLinkService
- **`/src/app/app.routes.ts`** - Added routes for profile/:username and review/:id

### iOS Configuration
- **`/ios/App/App/Info.plist`** - Added URL schemes and associated domains
  - Custom URL scheme: `urbanexplorer`
  - Associated domains: `urbanexplorer.app` and `www.urbanexplorer.app`

### Android Configuration
- **`/android/app/src/main/AndroidManifest.xml`** - Added intent filters
  - Custom URL scheme: `urbanexplorer`
  - App Links for: `/location`, `/profile`, `/review`

### Web Server Files
- **`/apple-app-site-association`** - iOS universal links configuration
- **`/assetlinks.json`** - Android App Links configuration

## iOS Setup Instructions

### 1. Configure Associated Domains in Xcode

1. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

2. Select your app target in Xcode
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability" and add "Associated Domains"
5. Add the following domains:
   - `applinks:urbanexplorer.app`
   - `applinks:www.urbanexplorer.app`

### 2. Update Team ID in apple-app-site-association

1. Get your Apple Team ID from:
   - Apple Developer Account > Membership
   - Or Xcode > Project Settings > Team

2. Update `apple-app-site-association` file:
   ```json
   "appID": "YOUR_TEAM_ID.app.urbanexplorer"
   ```

### 3. Deploy apple-app-site-association to Server

The `apple-app-site-association` file must be hosted at:
- `https://urbanexplorer.app/.well-known/apple-app-site-association`
- `https://www.urbanexplorer.app/.well-known/apple-app-site-association`

Requirements:
- Served over HTTPS
- Content-Type: `application/json`
- No file extension
- Must be accessible without redirects

Example nginx configuration:
```nginx
location /.well-known/apple-app-site-association {
    default_type application/json;
    add_header Content-Type application/json;
    return 200 '{ ... }';  # Your JSON content
}
```

### 4. Verify Universal Links (iOS)

Use Apple's App Search API Validation Tool:
```
https://search.developer.apple.com/appsearch-validation-tool/
```

Or test with command:
```bash
curl -I https://urbanexplorer.app/.well-known/apple-app-site-association
```

## Android Setup Instructions

### 1. Generate SHA-256 Certificate Fingerprint

For debug keystore:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

For release keystore:
```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your_alias
```

Copy the SHA-256 certificate fingerprint.

### 2. Update assetlinks.json

Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` in `assetlinks.json` with your actual SHA-256 fingerprint:

```json
{
  "sha256_cert_fingerprints": [
    "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
  ]
}
```

Note: Remove colons from the fingerprint for production builds.

### 3. Deploy assetlinks.json to Server

The `assetlinks.json` file must be hosted at:
- `https://urbanexplorer.app/.well-known/assetlinks.json`
- `https://www.urbanexplorer.app/.well-known/assetlinks.json`

Requirements:
- Served over HTTPS
- Content-Type: `application/json`
- Must be accessible without redirects

Example nginx configuration:
```nginx
location /.well-known/assetlinks.json {
    default_type application/json;
    add_header Content-Type application/json;
    return 200 '[{ ... }]';  # Your JSON content
}
```

### 4. Verify App Links (Android)

Use Google's Statement List Generator and Tester:
```
https://developers.google.com/digital-asset-links/tools/generator
```

Or test with command:
```bash
curl https://urbanexplorer.app/.well-known/assetlinks.json
```

## Build and Deploy

After making all configurations, rebuild the native projects:

```bash
# Build the web assets
npm run build

# Sync with native projects
npx cap sync

# Open in native IDEs for final testing
npx cap open ios
npx cap open android
```

## Testing Instructions

### Test Custom URL Scheme

#### iOS Simulator
```bash
xcrun simctl openurl booted "urbanexplorer://location/123"
xcrun simctl openurl booted "urbanexplorer://profile/johndoe"
xcrun simctl openurl booted "urbanexplorer://review/456"
```

#### Android Emulator
```bash
adb shell am start -W -a android.intent.action.VIEW -d "urbanexplorer://location/123" app.urbanexplorer
adb shell am start -W -a android.intent.action.VIEW -d "urbanexplorer://profile/johndoe" app.urbanexplorer
adb shell am start -W -a android.intent.action.VIEW -d "urbanexplorer://review/456" app.urbanexplorer
```

### Test Universal Links / App Links

#### iOS Simulator
```bash
xcrun simctl openurl booted "https://urbanexplorer.app/location/123"
xcrun simctl openurl booted "https://urbanexplorer.app/profile/johndoe"
xcrun simctl openurl booted "https://urbanexplorer.app/review/456"
```

#### Android Emulator
```bash
adb shell am start -W -a android.intent.action.VIEW -d "https://urbanexplorer.app/location/123" app.urbanexplorer
adb shell am start -W -a android.intent.action.VIEW -d "https://urbanexplorer.app/profile/johndoe" app.urbanexplorer
adb shell am start -W -a android.intent.action.VIEW -d "https://urbanexplorer.app/review/456" app.urbanexplorer
```

### Test from Web Browser

Create test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Deep Link Test</title>
</head>
<body>
    <h1>Urban Explorer Deep Link Test</h1>

    <h2>Custom URL Scheme</h2>
    <a href="urbanexplorer://location/123">Open Location 123</a><br>
    <a href="urbanexplorer://profile/johndoe">Open Profile: johndoe</a><br>
    <a href="urbanexplorer://review/456">Open Review 456</a><br>

    <h2>Universal Links / App Links</h2>
    <a href="https://urbanexplorer.app/location/123">Open Location 123</a><br>
    <a href="https://urbanexplorer.app/profile/johndoe">Open Profile: johndoe</a><br>
    <a href="https://urbanexplorer.app/review/456">Open Review 456</a><br>
</body>
</html>
```

### Test from JavaScript Console

In app's web view console or Safari/Chrome DevTools:
```javascript
// Test custom scheme
window.location.href = 'urbanexplorer://location/123';

// Test universal link
window.location.href = 'https://urbanexplorer.app/profile/johndoe';
```

### Verify Deep Link Handling in Code

You can also manually trigger deep link handling for testing:
```typescript
import { DeepLinkService } from './infrastructure/services/deep-link.service';

// In your component
constructor(private deepLinkService: DeepLinkService) {}

testDeepLink() {
  this.deepLinkService.handleUrl('urbanexplorer://location/123');
}
```

## Debugging

### iOS

1. Enable Associated Domains debugging:
   ```bash
   defaults write com.apple.CoreSimulator.CoreSimulatorBridge PasteboardAutomaticSync -bool true
   ```

2. Check console logs in Xcode for deep link events

3. Verify associated domains in Settings > Developer > Universal Links

### Android

1. Check App Links verification status:
   ```bash
   adb shell pm get-app-links app.urbanexplorer
   ```

2. View detailed App Links info:
   ```bash
   adb shell dumpsys package domain-preferred-apps
   ```

3. Reset App Links verification:
   ```bash
   adb shell pm set-app-links --package app.urbanexplorer 0 all
   ```

4. Check logcat for deep link events:
   ```bash
   adb logcat | grep -i "deep"
   ```

## Common Issues

### iOS Universal Links Not Working

1. Verify `apple-app-site-association` is accessible via HTTPS
2. Check that Team ID is correct in the association file
3. Ensure Associated Domains capability is enabled in Xcode
4. Clear app and reinstall to refresh association cache
5. Wait 24 hours for Apple CDN to cache the association file

### Android App Links Not Working

1. Verify `assetlinks.json` is accessible via HTTPS
2. Check SHA-256 fingerprint is correct
3. Verify app package name matches in manifest
4. Use `adb` commands to check verification status
5. Test with `autoVerify="false"` first, then enable it

### Deep Links Opening Browser Instead of App

1. Ensure app is installed and running
2. Verify domain verification is complete
3. Check that app is set as default handler for the domain
4. On iOS, long-press the link and select "Open in App"

## Additional Resources

- [Capacitor App Plugin Documentation](https://capacitorjs.com/docs/apis/app#addlistenerappurlopen-)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [Apple App Site Association Validator](https://branch.io/resources/aasa-validator/)
- [Android Digital Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

## Security Considerations

1. Always validate deep link parameters before navigation
2. Implement authentication checks for protected routes
3. Sanitize user input from deep link URLs
4. Log deep link events for analytics and debugging
5. Consider rate limiting for deep link handling

## Next Steps

1. Update the `apple-app-site-association` file with your actual Apple Team ID
2. Update the `assetlinks.json` file with your SHA-256 certificate fingerprint
3. Deploy both files to your web server at the `.well-known` directory
4. Test deep links on physical devices
5. Set up analytics to track deep link usage
6. Add deep link support to your marketing campaigns
7. Consider implementing deferred deep linking for user acquisition
