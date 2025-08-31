// Global variables
let currentUser = null;
let classes = [];
let homework = [];
let currentClassFilter = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize the application
function initializeApp() {
    // Wait for Firebase to be available
    if (window.firebase) {
        setupFirebaseAuth();
    } else {
        // Wait for Firebase to load
        setTimeout(initializeApp, 100);
    }
}

// Setup Firebase Authentication
function setupFirebaseAuth() {
    const { auth, onAuthStateChanged } = window.firebase;
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            currentUser = {
                id: user.uid,
                name: user.displayName,
                email: user.email,
                picture: user.photoURL
            };
            showAppSection();
            loadUserData();
        } else {
            // User is signed out
            currentUser = null;
            showLoginSection();
            clearData();
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Sign in buttons
    document.getElementById('signin-btn').addEventListener('click', signIn);
    document.getElementById('login-card-signin').addEventListener('click', signIn);
    
    // Sign out button
    document.getElementById('signout-btn').addEventListener('click', signOut);
    
    // Add homework button
    document.getElementById('add-homework-btn').addEventListener('click', () => {
        showModal('homework-modal');
    });
    
    // Add class button
    document.getElementById('add-class-btn').addEventListener('click', () => {
        showModal('class-modal');
    });
    
    // Modal close buttons
    document.getElementById('close-homework-modal').addEventListener('click', () => {
        hideModal('homework-modal');
    });
    
    document.getElementById('close-class-modal').addEventListener('click', () => {
        hideModal('class-modal');
    });
    
    // Cancel buttons
    document.getElementById('cancel-homework').addEventListener('click', () => {
        hideModal('homework-modal');
    });
    
    document.getElementById('cancel-class').addEventListener('click', () => {
        hideModal('class-modal');
    });
    
    // Form submissions
    document.getElementById('homework-form').addEventListener('submit', handleAddHomework);
    document.getElementById('class-form').addEventListener('submit', handleAddClass);
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Sign in with Google
async function signIn() {
    try {
        const { auth, provider, signInWithPopup } = window.firebase;
        const result = await signInWithPopup(auth, provider);
        showNotification('Successfully signed in!', 'success');
    } catch (error) {
        console.error('Sign in error:', error);
        showNotification('Sign in failed. Please try again.', 'error');
    }
}

// Sign out
async function signOut() {
    try {
        const { auth, signOut: firebaseSignOut } = window.firebase;
        await firebaseSignOut(auth);
        showNotification('Successfully signed out!', 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Sign out failed. Please try again.', 'error');
    }
}

// Show/Hide sections
function showAppSection() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'flex';
    document.getElementById('signout-btn').style.display = 'flex';
    document.getElementById('signin-btn').style.display = 'none';
}

function showLoginSection() {
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('app-section').style.display = 'none';
    document.getElementById('signout-btn').style.display = 'none';
    document.getElementById('signin-btn').style.display = 'flex';
}

// Clear data when user signs out
function clearData() {
    classes = [];
    homework = [];
    renderClasses();
    renderHomework();
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.classList.add('fade-in');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.classList.remove('fade-in');
    
    // Reset form
    if (modalId === 'homework-modal') {
        document.getElementById('homework-form').reset();
    } else if (modalId === 'class-modal') {
        document.getElementById('class-form').reset();
    }
}

// Handle add homework
async function handleAddHomework(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please sign in to add homework.', 'error');
        return;
    }
    
    try {
        const { db, collection, addDoc } = window.firebase;
        
        const newHomework = {
            userId: currentUser.id,
            title: document.getElementById('homework-title').value,
            description: document.getElementById('homework-description').value,
            classId: document.getElementById('homework-class').value,
            dueDate: document.getElementById('homework-due-date').value,
            priority: document.getElementById('homework-priority').value,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'homework'), newHomework);
        newHomework.id = docRef.id;
        
        homework.push(newHomework);
        renderHomework();
        hideModal('homework-modal');
        
        showNotification('Homework added successfully!', 'success');
    } catch (error) {
        console.error('Error adding homework:', error);
        showNotification('Failed to add homework. Please try again.', 'error');
    }
}

// Handle add class
async function handleAddClass(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please sign in to add classes.', 'error');
        return;
    }
    
    try {
        const { db, collection, addDoc } = window.firebase;
        
        const newClass = {
            userId: currentUser.id,
            name: document.getElementById('class-name').value,
            color: document.getElementById('class-color').value,
            createdAt: new Date().toISOString()
        };
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'classes'), newClass);
        newClass.id = docRef.id;
        
        classes.push(newClass);
        renderClasses();
        updateClassSelect();
        hideModal('class-modal');
        
        showNotification('Class added successfully!', 'success');
    } catch (error) {
        console.error('Error adding class:', error);
        showNotification('Failed to add class. Please try again.', 'error');
    }
}

// Render classes in sidebar
function renderClasses() {
    const classList = document.getElementById('class-list');
    const allClassesItem = classList.querySelector('[data-class="all"]');
    
    // Clear existing classes (except "All Homework")
    classList.innerHTML = '';
    classList.appendChild(allClassesItem);
    
    classes.forEach(cls => {
        const classItem = document.createElement('div');
        classItem.className = 'class-item';
        classItem.setAttribute('data-class', cls.id);
        classItem.innerHTML = `
            <i class="fas fa-book" style="color: ${cls.color}"></i>
            <span>${cls.name}</span>
        `;
        
        classItem.addEventListener('click', () => {
            selectClass(cls.id);
        });
        
        classList.appendChild(classItem);
    });
}

// Render homework list
function renderHomework() {
    const homeworkList = document.getElementById('homework-list');
    const filteredHomework = currentClassFilter === 'all' 
        ? homework 
        : homework.filter(hw => hw.classId === currentClassFilter);
    
    // Update count
    document.getElementById('homework-count').textContent = `${filteredHomework.length} assignment${filteredHomework.length !== 1 ? 's' : ''}`;
    
    if (filteredHomework.length === 0) {
        homeworkList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No homework yet</h3>
                <p>${currentClassFilter === 'all' ? 'Add your first homework assignment to get started' : 'No homework for this class yet'}</p>
            </div>
        `;
        return;
    }
    
    // Sort homework by due date
    filteredHomework.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    homeworkList.innerHTML = filteredHomework.map(hw => {
        const classInfo = classes.find(c => c.id === hw.classId);
        const dueDate = new Date(hw.dueDate);
        const isOverdue = dueDate < new Date() && !hw.completed;
        const isDueSoon = dueDate - new Date() < 24 * 60 * 60 * 1000 && !hw.completed; // Due within 24 hours
        
        return `
            <div class="homework-item ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}" data-id="${hw.id}">
                <div class="homework-header">
                    <div class="homework-title">
                        <input type="checkbox" ${hw.completed ? 'checked' : ''} onchange="toggleHomework('${hw.id}')">
                        <span class="${hw.completed ? 'completed' : ''}">${hw.title}</span>
                    </div>
                    <div class="homework-actions">
                        <button class="action-btn edit" onclick="editHomework('${hw.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteHomework('${hw.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="homework-meta">
                    <div class="meta-item">
                        <i class="fas fa-book" style="color: ${classInfo ? classInfo.color : '#667eea'}"></i>
                        <span>${classInfo ? classInfo.name : 'Unknown Class'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(dueDate)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="priority-badge priority-${hw.priority}">${hw.priority.charAt(0).toUpperCase() + hw.priority.slice(1)}</span>
                    </div>
                    ${isOverdue ? '<div class="meta-item overdue-badge"><i class="fas fa-exclamation-triangle"></i> Overdue</div>' : ''}
                    ${isDueSoon && !isOverdue ? '<div class="meta-item due-soon-badge"><i class="fas fa-clock"></i> Due Soon</div>' : ''}
                </div>
                ${hw.description ? `<div class="homework-description">${hw.description}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Select class filter
function selectClass(classId) {
    currentClassFilter = classId;
    
    // Update active class in sidebar
    document.querySelectorAll('.class-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-class="${classId}"]`).classList.add('active');
    
    // Update current class title
    if (classId === 'all') {
        document.getElementById('current-class').textContent = 'All Homework';
    } else {
        const classInfo = classes.find(c => c.id === classId);
        document.getElementById('current-class').textContent = classInfo ? classInfo.name : 'Unknown Class';
    }
    
    renderHomework();
}

// Toggle homework completion
async function toggleHomework(homeworkId) {
    if (!currentUser) return;
    
    try {
        const { db, doc, updateDoc } = window.firebase;
        const hw = homework.find(h => h.id === homeworkId);
        
        if (hw) {
            hw.completed = !hw.completed;
            
            // Update in Firestore
            const homeworkRef = doc(db, 'homework', homeworkId);
            await updateDoc(homeworkRef, {
                completed: hw.completed
            });
            
            renderHomework();
            
            const message = hw.completed ? 'Homework marked as completed!' : 'Homework marked as incomplete!';
            showNotification(message, 'success');
        }
    } catch (error) {
        console.error('Error updating homework:', error);
        showNotification('Failed to update homework. Please try again.', 'error');
    }
}

// Delete homework
async function deleteHomework(homeworkId) {
    if (!currentUser) return;
    
    if (confirm('Are you sure you want to delete this homework?')) {
        try {
            const { db, doc, deleteDoc } = window.firebase;
            
            // Delete from Firestore
            const homeworkRef = doc(db, 'homework', homeworkId);
            await deleteDoc(homeworkRef);
            
            // Remove from local array
            homework = homework.filter(h => h.id !== homeworkId);
            renderHomework();
            
            showNotification('Homework deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting homework:', error);
            showNotification('Failed to delete homework. Please try again.', 'error');
        }
    }
}

// Edit homework (placeholder for future implementation)
function editHomework(homeworkId) {
    // TODO: Implement edit functionality
    showNotification('Edit functionality coming soon!', 'info');
}

// Update class select dropdown
function updateClassSelect() {
    const classSelect = document.getElementById('homework-class');
    classSelect.innerHTML = '<option value="">Select a class</option>';
    
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        classSelect.appendChild(option);
    });
}

// Format date
function formatDate(date) {
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `Overdue (${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago)`;
    } else if (diffDays === 0) {
        return 'Due today';
    } else if (diffDays === 1) {
        return 'Due tomorrow';
    } else if (diffDays <= 7) {
        return `Due in ${diffDays} days`;
    } else {
        return date.toLocaleDateString();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Load user data from Firestore
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const { db, collection, query, where, getDocs } = window.firebase;
        
        // Load classes
        const classesQuery = query(collection(db, 'classes'), where('userId', '==', currentUser.id));
        const classesSnapshot = await getDocs(classesQuery);
        classes = [];
        classesSnapshot.forEach(doc => {
            classes.push({ id: doc.id, ...doc.data() });
        });
        
        // Load homework
        const homeworkQuery = query(collection(db, 'homework'), where('userId', '==', currentUser.id));
        const homeworkSnapshot = await getDocs(homeworkQuery);
        homework = [];
        homeworkSnapshot.forEach(doc => {
            homework.push({ id: doc.id, ...doc.data() });
        });
        
        // Render the data
        renderClasses();
        renderHomework();
        updateClassSelect();
        
        showNotification(`Welcome back, ${currentUser.name}!`, 'success');
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load your data. Please refresh the page.', 'error');
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .homework-item.overdue {
        border-left-color: #ef4444;
        background: #fef2f2;
    }
    
    .homework-item.due-soon {
        border-left-color: #f59e0b;
        background: #fffbeb;
    }
    
    .homework-title .completed {
        text-decoration: line-through;
        color: #9ca3af;
    }
    
    .overdue-badge {
        color: #dc2626;
        font-weight: 500;
    }
    
    .due-soon-badge {
        color: #d97706;
        font-weight: 500;
    }
    
    .homework-title input[type="checkbox"] {
        margin-right: 0.5rem;
        transform: scale(1.2);
    }
`;
document.head.appendChild(style);
