// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let currentUser = null;
let homeworkList = [];
let unsubscribe = null;

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
const filterSubject = document.getElementById('filter-subject');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');
const sortBy = document.getElementById('sort-by');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Listen for authentication state changes
    onAuthStateChanged(auth, handleAuthStateChange);
}

function setupEventListeners() {
    // Authentication
    googleSigninBtn.addEventListener('click', signInWithGoogle);
    signoutBtn.addEventListener('click', signOut);
    
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
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    showLoading(true);
    
    signInWithPopup(auth, provider)
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

function signOut() {
    signOut(auth)
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid
    };
    
    // Validate form
    if (!homework.title || !homework.subject || !homework.dueDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    showLoading(true);
    
    addDoc(collection(db, 'homework'), homework)
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
    
    const q = query(
        collection(db, 'homework'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
    );
    
    unsubscribe = onSnapshot(q, (snapshot) => {
        homeworkList = [];
        snapshot.forEach((doc) => {
            homeworkList.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
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
    
    if (filteredHomework.length === 0) {
        homeworkListElement.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    homeworkListElement.innerHTML = filteredHomework.map(homework => 
        createHomeworkItemHTML(homework)
    ).join('');
    
    // Add event listeners to action buttons
    addActionButtonListeners();
}

function createHomeworkItemHTML(homework) {
    const dueDate = homework.dueDate ? new Date(homework.dueDate).toLocaleDateString() : 'No date';
    const createdAt = homework.createdAt ? homework.createdAt.toDate().toLocaleDateString() : 'Unknown';
    const isOverdue = homework.dueDate && new Date(homework.dueDate) < new Date() && homework.status !== 'completed';
    
    return `
        <div class="homework-item ${homework.status} ${homework.priority}-priority ${isOverdue ? 'overdue' : ''}" data-id="${homework.id}">
            <div class="homework-header">
                <div>
                    <h3 class="homework-title">${escapeHtml(homework.title)}</h3>
                    <span class="homework-subject">${escapeHtml(homework.subject)}</span>
                </div>
                <div class="homework-actions">
                    <button class="action-btn edit" data-id="${homework.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${homework.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="homework-details">
                <div class="detail-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Due: ${dueDate}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-flag"></i>
                    <span class="priority-badge ${homework.priority}">${homework.priority}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-info-circle"></i>
                    <span class="status-badge ${homework.status}">${homework.status.replace('-', ' ')}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>Created: ${createdAt}</span>
                </div>
            </div>
            ${homework.description ? `<div class="homework-description">${escapeHtml(homework.description)}</div>` : ''}
            <div class="homework-actions-bottom">
                <button class="status-btn ${homework.status === 'pending' ? 'start' : homework.status === 'in-progress' ? 'complete' : 'reopen'}" 
                        data-id="${homework.id}" 
                        data-current-status="${homework.status}">
                    ${homework.status === 'pending' ? 'Start' : homework.status === 'in-progress' ? 'Complete' : 'Reopen'}
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
        updatedAt: serverTimestamp()
    };
    
    showLoading(true);
    
    updateDoc(doc(db, 'homework', id), updatedHomework)
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
    
    deleteDoc(doc(db, 'homework', id))
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
    
    updateDoc(doc(db, 'homework', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
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
