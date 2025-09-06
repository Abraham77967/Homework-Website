# Homework Tracker

A beautiful, modern homework tracking website that syncs data across all platforms using Google authentication.

## Features

- ✅ **Firebase Authentication** - Secure Google sign-in with Firebase
- 🔥 **Firestore Database** - Real-time cloud database for data persistence
- 📚 **Class Management** - Create and organize classes with custom colors
- 📝 **Homework Tracking** - Add, edit, and delete homework assignments
- 📅 **Due Date Management** - Set due dates and get smart notifications
- 🎯 **Priority Levels** - Mark homework as Low, Medium, or High priority
- ✅ **Completion Tracking** - Mark homework as completed with checkboxes
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 🔄 **Real-time Sync** - Data syncs across all devices automatically

## Setup Instructions

### 1. Firebase Project Setup

The application is already configured with Firebase! The Firebase configuration is included in the `index.html` file with the following project:
- **Project ID**: homework-website-25a85
- **Authentication**: Google Sign-in enabled
- **Database**: Firestore enabled

If you want to use your own Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication with Google Sign-in
4. Enable Firestore Database
5. Get your Firebase config from Project Settings
6. Replace the `firebaseConfig` object in `index.html`

### 2. Run the Application

#### Option 1: Simple HTTP Server (Recommended)
```bash
# Using Python 3
python -m http.server 3000

# Using Python 2
python -m SimpleHTTPServer 3000

# Using Node.js (if you have http-server installed)
npx http-server -p 3000

# Or simply run the provided server script
python server.py
```

#### Option 2: Live Server (VS Code Extension)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 3. Access the Application

Open your browser and go to:
- If using Python: `http://localhost:3000`
- If using Live Server: `http://localhost:5500` (or the port shown in VS Code)

## How to Use

### Getting Started
1. **Sign In** - Click the Google Sign-In button to authenticate
2. **Add Classes** - Click the "+" button in the sidebar to add your classes
3. **Add Homework** - Click "Add Homework" to create your first assignment

### Managing Homework
- **Add Homework**: Click "Add Homework" and fill out the form
- **Mark Complete**: Check the checkbox next to any homework item
- **Delete**: Click the trash icon to remove homework
- **Filter by Class**: Click on a class in the sidebar to filter homework

### Features Overview
- **Smart Due Dates**: Homework shows "Due today", "Due tomorrow", or "Overdue"
- **Priority Badges**: Visual indicators for Low, Medium, and High priority
- **Class Colors**: Each class has a custom color for easy identification
- **Responsive Design**: Works on all screen sizes

## File Structure

```
homework-tracker/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technical Details

### Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Vanilla JS with modern features
- **Firebase Authentication** - Secure Google sign-in
- **Firestore Database** - Real-time cloud database
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Data Storage
- **Firestore Database** - Real-time cloud database with automatic sync
- **User-specific data** - Each user's data is isolated and secure

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

- 🔄 **Real-time Updates** - Live updates when data changes
- 📱 **PWA Support** - Install as a mobile app
- 🔔 **Push Notifications** - Due date reminders
- 📊 **Analytics** - Progress tracking and statistics
- 🎨 **Dark Mode** - Toggle between light and dark themes
- 📤 **Export/Import** - Backup and restore functionality
- 👥 **Sharing** - Share homework with classmates
- 🔒 **Offline Support** - Work without internet connection

## Troubleshooting

### Firebase Sign-In Not Working
1. Check if Firebase is properly loaded in the browser console
2. Verify your Firebase project has Google Authentication enabled
3. Make sure you're running the app on a supported domain (localhost works for development)

### Data Not Saving
1. Ensure you're signed in with Google
2. Check if Firestore is enabled in your Firebase project
3. Verify your Firebase security rules allow read/write access
4. Check the browser console for any error messages

### Styling Issues
1. Make sure all CSS and font files are loading correctly
2. Check if your browser supports the CSS features used
3. Try refreshing the page

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Look for similar issues in the project
3. Create a new issue with detailed information

---

**Happy Homework Tracking! 📚✨**
