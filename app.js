// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCA3ECMlIUGr9lh56y4lfcv2Laehxxln2A",
  authDomain: "homework-website-236e8.firebaseapp.com",
  projectId: "homework-website-236e8",
  storageBucket: "homework-website-236e8.firebasestorage.app",
  messagingSenderId: "111412349330",
  appId: "1:111412349330:web:30f429000a07a3fd13194b",
  measurementId: "G-BYR8YTGDFL"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Global variables
let currentUser = null;
let homeworkList = [];
let selectedClass = 'all';
let unsubscribe = null;
let currentTheme = 'light';

// DOM elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const googleSigninBtn = document.getElementById('google-signin-btn');
const signoutBtn = document.getElementById('signout-btn');
const authError = document.getElementById('auth-error');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const homeworkForm = document.getElementById('homework-form');
const homeworkListElement = document.getElementById('homework-list');
const emptyState = document.getElementById('empty-state');
const loadingSpinner = document.getElementById('loading-spinner');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');
const sortBy = document.getElementById('sort-by');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize theme
    initializeTheme();
    
    // Set up event listeners
    setupEventListeners();
    
    // Listen for authentication state changes
    auth.onAuthStateChanged(handleAuthStateChange);
}

function setupEventListeners() {
    // Authentication
    googleSigninBtn.addEventListener('click', signInWithGoogle);
    signoutBtn.addEventListener('click', handleSignOut);
    
    // Form submission
    homeworkForm.addEventListener('submit', handleAddHomework);
    
    // Filters and sorting
    filterSubject.addEventListener('change', filterAndSortHomework);
    filterPriority.addEventListener('change', filterAndSortHomework);
    filterStatus.addEventListener('change', filterAndSortHomework);
    sortBy.addEventListener('change', filterAndSortHomework);
}

// Authentication functions
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    showLoading(true);
    
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log('Sign in successful:', result.user);
            hideAuthError();
        })
        .catch((error) => {
            console.error('Sign in error:', error);
            showAuthError('Failed to sign in. Please try again.');
        })
        .finally(() => {
            showLoading(false);
        });
}

function handleSignOut() {
    auth.signOut()
        .then(() => {
            console.log('Sign out successful');
        })
        .catch((error) => {
            console.error('Sign out error:', error);
        });
}

function handleAuthStateChange(user) {
    if (user) {
        currentUser = user;
        showApp();
        updateUserInfo(user);
        setupRealtimeListener();
    } else {
        currentUser = null;
        showAuth();
        cleanupRealtimeListener();
    }
}

function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.add('hidden');
    setTimeout(() => {
        appSection.classList.remove('hidden');
    }, 100);
}

function updateUserInfo(user) {
    userAvatar.src = user.photoURL || '';
    userAvatar.alt = user.displayName || 'User Avatar';
    userName.textContent = user.displayName || user.email;
}

function showAuthError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
}

function hideAuthError() {
    authError.style.display = 'none';
}

// Homework management functions
function handleAddHomework(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showAuthError('Please sign in to add homework');
        return;
    }
    
    const formData = new FormData(homeworkForm);
    const homework = {
        title: formData.get('title').trim(),
        subject: formData.get('subject'),
        dueDate: formData.get('dueDate'),
        priority: formData.get('priority'),
        description: formData.get('description').trim(),
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        userId: currentUser.uid
    };
    
    // Validate form
    if (!homework.title || !homework.subject || !homework.dueDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    showLoading(true);
    
    db.collection('homework').add(homework)
        .then((docRef) => {
            console.log('Homework added with ID:', docRef.id);
            homeworkForm.reset();
            hideAuthError();
        })
        .catch((error) => {
            console.error('Error adding homework:', error);
            alert('Failed to add homework. Please try again.');
        })
        .finally(() => {
            showLoading(false);
        });
}

function setupRealtimeListener() {
    if (!currentUser) return;
    
    console.log('Setting up realtime listener for user:', currentUser.uid);
    
    unsubscribe = db.collection('homework')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
        console.log('Snapshot received:', snapshot.size, 'documents');
        homeworkList = [];
        snapshot.forEach((doc) => {
            console.log('Document:', doc.id, doc.data());
            homeworkList.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('Homework list updated:', homeworkList);
        renderHomeworkList();
    }, (error) => {
        console.error('Error listening to homework updates:', error);
    });
}

function cleanupRealtimeListener() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    homeworkList = [];
    renderHomeworkList();
}

function renderHomeworkList() {
    const filteredHomework = getFilteredHomework();
    
    console.log('Rendering homework list. Total:', homeworkList.length, 'Filtered:', filteredHomework.length);
    
    // Render class navigation
    renderClassNavigation();
    
    // Filter by selected class
    const classFilteredHomework = selectedClass === 'all' 
        ? filteredHomework 
        : filteredHomework.filter(homework => homework.subject === selectedClass);
    
    if (classFilteredHomework.length === 0) {
        homeworkListElement.innerHTML = '';
        emptyState.style.display = 'block';
        console.log('Showing empty state');
        return;
    }
    
    emptyState.style.display = 'none';
    console.log('Rendering', classFilteredHomework.length, 'homework items');
    
    homeworkListElement.innerHTML = classFilteredHomework.map(homework => 
        createHomeworkItemHTML(homework)
    ).join('');
    
    // Add event listeners to action buttons
    addActionButtonListeners();
}

function renderClassNavigation() {
    const classNavElement = document.getElementById('classNav');
    
    // Get unique classes from homework
    const classes = [...new Set(homeworkList.map(homework => homework.subject || 'Other'))];
    
    // Create navigation buttons
    const navButtons = [
        {
            id: 'all',
            name: 'All Classes',
            count: homeworkList.length
        },
        ...classes.map(subject => ({
            id: subject,
            name: subject,
            count: homeworkList.filter(homework => homework.subject === subject).length
        }))
    ];
    
    classNavElement.innerHTML = navButtons.map(btn => `
        <button class="class-nav-btn ${btn.id === selectedClass ? 'active' : ''}" 
                data-class="${btn.id}">
            ${btn.name}
            <span class="count">${btn.count}</span>
        </button>
    `).join('');
    
    // Add event listeners to class navigation buttons
    classNavElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('class-nav-btn')) {
            selectedClass = e.target.dataset.class;
            renderHomeworkList();
        }
    });
}

function createHomeworkItemHTML(homework) {
    const dueDate = homework.dueDate ? new Date(homework.dueDate).toLocaleDateString() : 'No date';
    const isOverdue = homework.dueDate && new Date(homework.dueDate) < new Date() && homework.status !== 'completed';
    
    // Calculate days until due
    let daysUntilDue = '';
    if (homework.dueDate) {
        const today = new Date();
        const due = new Date(homework.dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            daysUntilDue = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
        } else if (diffDays === 0) {
            daysUntilDue = 'Due today';
        } else if (diffDays === 1) {
            daysUntilDue = 'Due tomorrow';
        } else {
            daysUntilDue = `Due in ${diffDays} days`;
        }
    }
    
    return `
        <div class="homework-item glow-hover ${homework.status} ${homework.priority}-priority ${isOverdue ? 'overdue' : ''}" data-id="${homework.id}">
            <div class="homework-main">
                <h3 class="homework-title">${escapeHtml(homework.title)}</h3>
                <span class="homework-subject">${escapeHtml(homework.subject)}</span>
            </div>
            <div class="due-date-main">
                <div class="due-date ${isOverdue ? 'overdue' : ''}">${dueDate}</div>
                <div class="days-until ${isOverdue ? 'overdue' : ''}">${daysUntilDue}</div>
            </div>
            <div class="homework-status">
                <span class="status-badge ${homework.status}">${homework.status.replace('-', ' ')}</span>
            </div>
            <div class="homework-actions">
                <button class="action-btn edit glow-hover" data-id="${homework.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete glow-hover" data-id="${homework.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function addActionButtonListeners() {
    // Edit buttons
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.action-btn').dataset.id;
            editHomework(id);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.action-btn').dataset.id;
            deleteHomework(id);
        });
    });
    
    // Status buttons
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const currentStatus = e.target.dataset.currentStatus;
            updateHomeworkStatus(id, currentStatus);
        });
    });
}

function editHomework(id) {
    const homework = homeworkList.find(h => h.id === id);
    if (!homework) return;
    
    // Populate form with existing data
    document.getElementById('title').value = homework.title;
    document.getElementById('subject').value = homework.subject;
    document.getElementById('due-date').value = homework.dueDate;
    document.getElementById('priority').value = homework.priority;
    document.getElementById('description').value = homework.description || '';
    
    // Scroll to form
    document.querySelector('.add-homework-section').scrollIntoView({ behavior: 'smooth' });
    
    // Update form to edit mode
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Homework';
    submitBtn.dataset.editId = id;
    
    // Change form handler temporarily
    homeworkForm.removeEventListener('submit', handleAddHomework);
    homeworkForm.addEventListener('submit', (e) => handleUpdateHomework(e, id));
}

function handleUpdateHomework(e, id) {
    e.preventDefault();
    
    const formData = new FormData(homeworkForm);
    const updatedHomework = {
        title: formData.get('title').trim(),
        subject: formData.get('subject'),
        dueDate: formData.get('dueDate'),
        priority: formData.get('priority'),
        description: formData.get('description').trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    showLoading(true);
    
    db.collection('homework').doc(id).update(updatedHomework)
        .then(() => {
            console.log('Homework updated successfully');
            resetForm();
        })
        .catch((error) => {
            console.error('Error updating homework:', error);
            alert('Failed to update homework. Please try again.');
        })
        .finally(() => {
            showLoading(false);
        });
}

function deleteHomework(id) {
    if (!confirm('Are you sure you want to delete this homework?')) {
        return;
    }
    
    showLoading(true);
    
    db.collection('homework').doc(id).delete()
        .then(() => {
            console.log('Homework deleted successfully');
        })
        .catch((error) => {
            console.error('Error deleting homework:', error);
            alert('Failed to delete homework. Please try again.');
        })
        .finally(() => {
            showLoading(false);
        });
}

function updateHomeworkStatus(id, currentStatus) {
    let newStatus;
    switch (currentStatus) {
        case 'pending':
            newStatus = 'in-progress';
            break;
        case 'in-progress':
            newStatus = 'completed';
            break;
        case 'completed':
            newStatus = 'pending';
            break;
        default:
            return;
    }
    
    showLoading(true);
    
    db.collection('homework').doc(id).update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            console.log('Homework status updated successfully');
        })
        .catch((error) => {
            console.error('Error updating homework status:', error);
            alert('Failed to update homework status. Please try again.');
        })
        .finally(() => {
            showLoading(false);
        });
}

function resetForm() {
    homeworkForm.reset();
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Homework';
    submitBtn.removeAttribute('data-edit-id');
    
    // Restore original form handler
    homeworkForm.removeEventListener('submit', handleUpdateHomework);
    homeworkForm.addEventListener('submit', handleAddHomework);
}

// Filtering and sorting functions
function getFilteredHomework() {
    let filtered = [...homeworkList];
    
    // Apply filters
    if (filterSubject.value) {
        filtered = filtered.filter(h => h.subject === filterSubject.value);
    }
    
    if (filterPriority.value) {
        filtered = filtered.filter(h => h.priority === filterPriority.value);
    }
    
    if (filterStatus.value) {
        filtered = filtered.filter(h => h.status === filterStatus.value);
    }
    
    // Apply sorting
    const sortValue = sortBy.value;
    filtered.sort((a, b) => {
        switch (sortValue) {
            case 'dueDate':
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'createdAt':
                return b.createdAt - a.createdAt;
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });
    
    return filtered;
}

function filterAndSortHomework() {
    renderHomeworkList();
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('App is online');
});

window.addEventListener('offline', () => {
    console.log('App is offline');
});

// Theme Management Functions
function initializeTheme() {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        // Auto-detect theme based on time of day
        currentTheme = getTimeBasedTheme();
    }
    
    applyTheme(currentTheme);
    updateThemeIcon();
    
    // Set up theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            currentTheme = e.matches ? 'dark' : 'light';
            applyTheme(currentTheme);
            updateThemeIcon();
        }
    });
    
    // Auto-switch theme based on time every hour
    setInterval(() => {
        if (!localStorage.getItem('theme')) {
            const timeBasedTheme = getTimeBasedTheme();
            if (timeBasedTheme !== currentTheme) {
                currentTheme = timeBasedTheme;
                applyTheme(currentTheme);
                updateThemeIcon();
            }
        }
    }, 60 * 60 * 1000); // Check every hour
}

function getTimeBasedTheme() {
    const hour = new Date().getHours();
    // Dark mode from 7 PM to 7 AM
    return (hour >= 19 || hour < 7) ? 'dark' : 'light';
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    updateThemeIcon();
    
    // Save user preference
    localStorage.setItem('theme', currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
}

function updateThemeIcon() {
    if (!themeIcon) return;
    
    // Clear existing content
    themeIcon.innerHTML = '';
    
    if (currentTheme === 'light') {
        // Sun icon for light mode
        themeIcon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
    } else {
        // Moon icon for dark mode
        themeIcon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
    }
}

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
