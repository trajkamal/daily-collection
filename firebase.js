// Firebase configuration
// Get these values from your Firebase project settings
// 1. Go to https://console.firebase.google.com/
// 2. Select your project
// 3. Go to Project Settings > General > Your apps
// 4. Add a web app if you haven't already
// 5. Copy the config values below

const firebaseConfig = {
  apiKey: "AIzaSyDc3KloTjYniGqT4Nd0u1h0dmc4NuqZ1V0",
  authDomain: "daily-collection-35de7.firebaseapp.com",
  projectId: "daily-collection-35de7",
  storageBucket: "daily-collection-35de7.firebasestorage.app",
  messagingSenderId: "724634109915",
  appId: "1:724634109915:web:e31ee1c37a5db1be0d09fe"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Enable offline persistence for faster loads and offline support
db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence disabled: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported in this browser');
    }
  });

// Export for use in other files
window.db = db;