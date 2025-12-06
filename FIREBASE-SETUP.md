# Firebase Setup Guide

This guide explains how to configure Firebase for Urban Explorer releases.

## Important: ONE Project, Multiple Apps

Firebase uses a single project to manage all platforms:

```
Firebase Project: urban-explorer
├── Android App (app.urbanexplorer)
├── iOS App (app.urbanexplorer)
└── Web App (Firebase Hosting)
```

## Prerequisites

- Google account
- Firebase CLI installed: `npm install -g firebase-tools`

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it: `urban-explorer` (this is the project ID)
4. Enable/disable Google Analytics as needed
5. Click "Create project"

## Step 2: Add Apps to the Project

### Add Android App
1. In Project Overview, click "Add app" → Android icon
2. Package name: `app.urbanexplorer`
3. App nickname: `Urban Explorer Android`
4. Download `google-services.json` (optional, for analytics)
5. Note the **App ID**: `1:XXXXXXXXX:android:XXXXXXXX`

### Add iOS App (for future use)
1. Click "Add app" → iOS icon
2. Bundle ID: `app.urbanexplorer`
3. App nickname: `Urban Explorer iOS`
4. Download `GoogleService-Info.plist` (optional)
5. Note the **App ID**: `1:XXXXXXXXX:ios:XXXXXXXX`

### Add Web App
1. Click "Add app" → Web icon
2. App nickname: `Urban Explorer Web`
3. This enables Firebase Hosting

## Step 3: Configure Firebase Hosting

1. In Firebase Console, go to "Build" > "Hosting"
2. Click "Get started"
3. Follow the setup wizard (you can skip the CLI steps, we use GitHub Actions)

## Step 4: Configure App Distribution

1. In Firebase Console, go to "Release & Monitor" > "App Distribution"
2. Click "Get started"
3. Select your Android app
4. Create a tester group named "testers"

## Step 5: Get Firebase Configuration Values

### Project ID
Found in Project Settings > General > Project ID

### Android App ID
Found in Project Settings > Your apps > Android app > App ID
Format: `1:123456789:android:abcdef123456`

### Service Account

1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. This will be used as `FIREBASE_SERVICE_ACCOUNT` secret

## Step 6: Configure GitHub Secrets

Go to your GitHub repository > Settings > Secrets and variables > Actions

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `FIREBASE_PROJECT_ID` | `urban-explorer-app` | Your Firebase project ID |
| `FIREBASE_ANDROID_APP_ID` | `1:xxx:android:xxx` | Android app ID from Firebase |
| `FIREBASE_SERVICE_ACCOUNT` | `{...json...}` | Full content of service account JSON |

## Step 7: Update .firebaserc

Edit `.firebaserc` with your actual project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

## Local Testing

### Deploy to Firebase Hosting manually:

```bash
# Login to Firebase
firebase login

# Build the app
npm run build

# Deploy
firebase deploy --only hosting
```

### Upload APK to App Distribution manually:

```bash
# Build the APK first
cd android && ./gradlew assembleDebug && cd ..

# Upload using Firebase CLI
firebase appdistribution:distribute android/app/build/outputs/apk/debug/app-debug.apk \
  --app YOUR_ANDROID_APP_ID \
  --groups "testers" \
  --release-notes "Test release"
```

## Release Workflow

The release workflow automatically:

1. **Builds** web and Android versions
2. **Deploys** web to Firebase Hosting
3. **Uploads** APK to Firebase App Distribution
4. **Creates** GitHub Release with all artifacts

### Trigger a Release

```bash
# Create and push a tag
git tag v1.1.0
git push origin v1.1.0
```

### Manual Trigger

You can also trigger the release workflow manually from GitHub Actions:
1. Go to Actions > Release
2. Click "Run workflow"
3. Choose whether to deploy to Firebase

## Tester Access

### Inviting Testers

1. Go to Firebase Console > App Distribution
2. Click on your app
3. Go to "Testers & Groups"
4. Add testers by email
5. Add them to the "testers" group

### For Testers

1. You'll receive an email invitation
2. Install the Firebase App Tester app:
   - [Android](https://play.google.com/store/apps/details?id=com.google.firebase.apptester)
3. Sign in with the invited email
4. New releases will appear automatically

## Troubleshooting

### Build fails with "No google-services.json found"

The app works without it - it's only needed for Firebase Analytics/Crashlytics.

### App Distribution upload fails

1. Verify `FIREBASE_ANDROID_APP_ID` is correct
2. Check service account has "Firebase App Distribution Admin" role

### Hosting deploy fails

1. Verify `FIREBASE_PROJECT_ID` is correct
2. Check service account has "Firebase Hosting Admin" role

---

## Security Notes

- Never commit `google-services.json` with sensitive data
- Never commit service account JSON files
- Use GitHub Secrets for all sensitive values
- The service account should have minimal required permissions
