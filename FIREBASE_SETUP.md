# Firebase Setup Guide

## Step 1: Access Firebase Console
1. Go to: https://console.firebase.google.com/project/homework-website-25a85
2. Sign in with your Google account

## Step 2: Find Firestore Database
1. In the left sidebar, look for the **"Build"** section
2. You should see:
   - Authentication
   - **Firestore Database** ← Click this
   - Realtime Database
   - Storage
   - Hosting

## Step 3: Create Firestore Database
1. Click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (allows all reads/writes for development)
4. Select a **location** (choose the closest to you)
5. Click **"Done"**

## Step 4: Set Firestore Rules (IMPORTANT!)
1. In Firestore, click **"Rules"** tab
2. Replace the rules with this code:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **"Publish"**

## Step 5: Verify Setup
After creation, you should see:
- A Firestore database interface
- Collections will be empty initially
- Rules will be set to "test mode"

## Step 6: Test the App
1. Go to: http://localhost:3000
2. Sign in with Google
3. Try adding a class
4. Check browser console for any errors

## Troubleshooting

### If you get "Failed to load your data":
1. **Check Firestore Rules** - Make sure they allow read/write
2. **Check browser console** for specific error messages
3. **Try refreshing the page**
4. **Sign out and sign back in**

### If you don't see "Firestore Database":
1. Make sure you're in the correct Firebase project
2. Try refreshing the page
3. Check if you have the necessary permissions

### If you see "Realtime Database" instead:
- Realtime Database and Firestore Database are different services
- We need Firestore Database for this app
- Look for "Firestore Database" in the Build section

## Alternative: Use Local Version
If you want to test immediately:
1. Go to: http://localhost:3000/index-local.html
2. Click "Start Using App"
3. Test functionality without Firebase
