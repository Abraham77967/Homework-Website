# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "homework-tracker")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Enable it and configure:
   - Project support email: your email
   - Project public-facing name: "Homework Tracker"
6. Click "Save"

## Step 3: Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to you)
5. Click "Done"

## Step 4: Get Your Firebase Config

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "homework-tracker-web")
6. Copy the firebaseConfig object

## Step 5: Update Your Application

1. Open `index.html`
2. Find the `firebaseConfig` object
3. Replace it with your copied configuration

## Step 6: Configure Security Rules (Optional)

In Firestore Database > Rules, you can use these rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 7: Test Your Setup

1. Run your application: `python server.py`
2. Open `http://localhost:3000`
3. Try signing in with Google
4. Check the browser console for any errors

## Troubleshooting

### "auth/configuration-not-found" Error
- Make sure you've copied the correct Firebase config
- Verify your project ID matches exactly
- Check that Authentication is enabled

### "auth/unauthorized-domain" Error
- In Firebase Console > Authentication > Settings > Authorized domains
- Add `localhost` for development
- Add your production domain when deploying

### "permission-denied" Error
- Check your Firestore security rules
- Make sure you're signed in before trying to read/write data

## Demo Configuration (For Testing)

If you want to test the app quickly, you can use this demo configuration (but it won't persist data):

```javascript
const firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo"
};
```

**Note**: The demo config won't actually work with Firebase - you need to create your own project for real functionality.
