// Global variables
let currentUser = { id: 'local-user', name: 'Local User' };
let classes = [];
let homework = [];
let currentClassFilter = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadDataFromStorage();
});

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
    
    // Edit homework modal close buttons
    document.getElementById('close-edit-homework-modal').addEventListener('click', () => {
        hideModal('edit-homework-modal');
    });
    
    document.getElementById('cancel-edit-homework').addEventListener('click', () => {
        hideModal('edit-homework-modal');
    });
    
    // Edit class modal close buttons
    document.getElementById('close-edit-class-modal').addEventListener('click', () => {
        hideModal('edit-class-modal');
    });
    
    document.getElementById('cancel-edit-class').addEventListener('click', () => {
        hideModal('edit-class-modal');
    });
    
    // Form submissions
    document.getElementById('homework-form').addEventListener('submit', handleAddHomework);
    document.getElementById('class-form').addEventListener('submit', handleAddClass);
    document.getElementById('edit-homework-form').addEventListener('submit', handleEditHomework);
    document.getElementById('edit-class-form').addEventListener('submit', handleEditClass);
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Sign in (local version)
function signIn() {
    showAppSection();
    showNotification('Welcome to Homework Tracker!', 'success');
}

// Sign out (local version)
function signOut() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        currentUser = null;
        classes = [];
        homework = [];
        localStorage.removeItem('homeworkTracker_classes');
        localStorage.removeItem('homeworkTracker_homework');
        showLoginSection();
        showNotification('All data cleared!', 'success');
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
    } else if (modalId === 'edit-homework-modal') {
        document.getElementById('edit-homework-form').reset();
    } else if (modalId === 'edit-class-modal') {
        document.getElementById('edit-class-form').reset();
    }
}

// Handle add homework
function handleAddHomework(e) {
    e.preventDefault();
    
    const newHomework = {
        id: Date.now().toString(),
        title: document.getElementById('homework-title').value,
        description: document.getElementById('homework-description').value,
        classId: document.getElementById('homework-class').value,
        dueDate: document.getElementById('homework-due-date').value,
        priority: document.getElementById('homework-priority').value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    homework.push(newHomework);
    saveDataToStorage();
    renderHomework();
    hideModal('homework-modal');
    
    showNotification('Homework added successfully!', 'success');
}

// Handle add class
function handleAddClass(e) {
    e.preventDefault();
    
    const newClass = {
        id: Date.now().toString(),
        name: document.getElementById('class-name').value,
        color: document.getElementById('class-color').value,
        createdAt: new Date().toISOString()
    };
    
    classes.push(newClass);
    saveDataToStorage();
    renderClasses();
    updateClassSelect();
    hideModal('class-modal');
    
    showNotification('Class added successfully!', 'success');
}

// Handle edit class
function handleEditClass(e) {
    e.preventDefault();
    
    const classId = document.getElementById('edit-class-form').getAttribute('data-class-id');
    const cls = classes.find(c => c.id === classId);
    
    if (!cls) {
        showNotification('Class not found.', 'error');
        return;
    }
    
    // Update class data
    cls.name = document.getElementById('edit-class-name').value;
    cls.color = document.getElementById('edit-class-color').value;
    cls.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    saveDataToStorage();
    
    // Update UI
    renderClasses();
    updateClassSelect();
    renderHomework(); // Re-render homework to update class names
    hideModal('edit-class-modal');
    
    showNotification('Class updated successfully!', 'success');
}

// Render classes in sidebar
function renderClasses() {
    const classList = document.getElementById('class-list');
    const allClassesItem = classList.querySelector('[data-class="all"]');
    
    // Clear existing classes (except "All Homework")
    classList.innerHTML = '';
    classList.appendChild(allClassesItem);
    
    // Add click event listener to "All Homework" button
    allClassesItem.addEventListener('click', () => {
        selectClass('all');
    });
    
    classes.forEach(cls => {
        const classItem = document.createElement('div');
        classItem.className = 'class-item';
        classItem.setAttribute('data-class', cls.id);
        classItem.innerHTML = `
            <div class="class-info" onclick="selectClass('${cls.id}')">
                <i class="fas fa-book" style="color: ${cls.color}"></i>
                <span>${cls.name}</span>
                <span class="homework-count">(${homework.filter(hw => hw.classId === cls.id).length})</span>
            </div>
            <div class="class-actions">
                <button class="action-btn edit" onclick="editClass('${cls.id}')" title="Edit Class">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteClass('${cls.id}')" title="Delete Class">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
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
        
        // Status classes for the card
        const statusClasses = [];
        if (hw.completed) statusClasses.push('completed');
        if (isOverdue) statusClasses.push('overdue');
        if (isDueSoon && !isOverdue) statusClasses.push('due-soon');
        
        return `
            <div class="homework-item ${statusClasses.join(' ')}" data-id="${hw.id}">
                <div class="homework-header">
                    <div class="homework-title">
                        <input type="checkbox" ${hw.completed ? 'checked' : ''} onchange="toggleHomework('${hw.id}')">
                        <span>${hw.title}</span>
                    </div>
                    <div class="homework-actions">
                        <button class="action-btn edit" onclick="editHomework('${hw.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteHomework('${hw.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="homework-meta">
                    <div class="meta-item">
                        <i class="fas fa-book"></i>
                        <span class="meta-label">Class:</span>
                        <span class="meta-value">${classInfo ? classInfo.name : 'Unknown Class'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span class="meta-label">Due:</span>
                        <span class="meta-value">${formatDate(dueDate)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-flag"></i>
                        <span class="meta-label">Priority:</span>
                        <span class="priority-badge priority-${hw.priority}">${hw.priority.charAt(0).toUpperCase() + hw.priority.slice(1)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-info-circle"></i>
                        <span class="meta-label">Status:</span>
                        ${hw.completed ? '<span class="status-badge completed-badge">Completed</span>' : 
                          isOverdue ? '<span class="status-badge overdue-badge">Overdue</span>' : 
                          isDueSoon ? '<span class="status-badge due-soon-badge">Due Soon</span>' : 
                          '<span class="status-badge">On Track</span>'}
                    </div>
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
function toggleHomework(homeworkId) {
    const hw = homework.find(h => h.id === homeworkId);
    if (hw) {
        hw.completed = !hw.completed;
        saveDataToStorage();
        renderHomework();
        
        const message = hw.completed ? 'Homework marked as completed!' : 'Homework marked as incomplete!';
        showNotification(message, 'success');
    }
}

// Delete homework
function deleteHomework(homeworkId) {
    if (confirm('Are you sure you want to delete this homework?')) {
        homework = homework.filter(h => h.id !== homeworkId);
        saveDataToStorage();
        renderHomework();
        
        showNotification('Homework deleted successfully!', 'success');
    }
}

// Global variable to track homework being edited
let editingHomeworkId = null;

// Edit homework
function editHomework(homeworkId) {
    const hw = homework.find(h => h.id === homeworkId);
    if (!hw) {
        showNotification('Homework not found!', 'error');
        return;
    }
    
    // Store the ID of homework being edited
    editingHomeworkId = homeworkId;
    
    // Populate the edit form with current values
    document.getElementById('edit-homework-title').value = hw.title;
    document.getElementById('edit-homework-description').value = hw.description || '';
    document.getElementById('edit-homework-class').value = hw.classId;
    document.getElementById('edit-homework-due-date').value = hw.dueDate;
    document.getElementById('edit-homework-priority').value = hw.priority;
    
    // Update the class select for edit modal
    updateEditClassSelect();
    
    // Show the edit modal
    showModal('edit-homework-modal');
}

// Handle edit homework form submission
function handleEditHomework(e) {
    e.preventDefault();
    
    if (!editingHomeworkId) {
        showNotification('Error: No homework selected for editing.', 'error');
        return;
    }
    
    const updatedHomework = {
        title: document.getElementById('edit-homework-title').value,
        description: document.getElementById('edit-homework-description').value,
        classId: document.getElementById('edit-homework-class').value,
        dueDate: document.getElementById('edit-homework-due-date').value,
        priority: document.getElementById('edit-homework-priority').value,
        updatedAt: new Date().toISOString()
    };
    
    // Update in local array
    const hwIndex = homework.findIndex(h => h.id === editingHomeworkId);
    if (hwIndex !== -1) {
        homework[hwIndex] = { ...homework[hwIndex], ...updatedHomework };
    }
    
    saveDataToStorage();
    renderHomework();
    hideModal('edit-homework-modal');
    editingHomeworkId = null;
    
    showNotification('Homework updated successfully!', 'success');
}

// Update class select dropdown for edit modal
function updateEditClassSelect() {
    const classSelect = document.getElementById('edit-homework-class');
    classSelect.innerHTML = '<option value="">Select a class</option>';
    
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        classSelect.appendChild(option);
    });
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

// Data persistence functions
function saveDataToStorage() {
    localStorage.setItem('homeworkTracker_classes', JSON.stringify(classes));
    localStorage.setItem('homeworkTracker_homework', JSON.stringify(homework));
}

function loadDataFromStorage() {
    const savedClasses = localStorage.getItem('homeworkTracker_classes');
    const savedHomework = localStorage.getItem('homeworkTracker_homework');
    
    if (savedClasses) {
        classes = JSON.parse(savedClasses);
    }
    
    if (savedHomework) {
        homework = JSON.parse(savedHomework);
    }
    
    renderClasses();
    renderHomework();
    updateClassSelect();
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
    

`;
document.head.appendChild(style);

// Edit class function
function editClass(classId) {
    const cls = classes.find(c => c.id === classId);
    if (!cls) {
        showNotification('Class not found.', 'error');
        return;
    }
    
    // Populate the edit form
    document.getElementById('edit-class-name').value = cls.name;
    document.getElementById('edit-class-color').value = cls.color;
    
    // Store the class ID for the form submission
    document.getElementById('edit-class-form').setAttribute('data-class-id', classId);
    
    // Show the modal
    showModal('edit-class-modal');
}

// Delete class function
function deleteClass(classId) {
    const cls = classes.find(c => c.id === classId);
    if (!cls) {
        showNotification('Class not found.', 'error');
        return;
    }
    
    // Check if class has homework
    const classHomework = homework.filter(hw => hw.classId === classId);
    if (classHomework.length > 0) {
        const confirmed = confirm(`This class has ${classHomework.length} homework assignment(s). Deleting the class will also delete all associated homework. Are you sure you want to continue?`);
        if (!confirmed) {
            return;
        }
    } else {
        const confirmed = confirm(`Are you sure you want to delete "${cls.name}"?`);
        if (!confirmed) {
            return;
        }
    }
    
    // Remove from local arrays
    classes = classes.filter(c => c.id !== classId);
    homework = homework.filter(hw => hw.classId !== classId);
    
    // Save to localStorage
    saveDataToStorage();
    
    // Update UI
    renderClasses();
    renderHomework();
    updateClassSelect();
    
    // If the deleted class was selected, switch to "all"
    if (currentClassFilter === classId) {
        selectClass('all');
    }
    
    showNotification('Class and associated homework deleted successfully!', 'success');
}

// Initialize color pickers with preset colors
function initializeColorPickers() {
    const colorPickers = document.querySelectorAll('input[type="color"]');
    const presetColorContainers = document.querySelectorAll('.preset-colors');
    
    colorPickers.forEach((colorPicker, index) => {
        const presetColors = presetColorContainers[index]?.querySelectorAll('.preset-color');
        
        if (presetColors) {
            // Handle preset color selection
            presetColors.forEach(color => {
                color.addEventListener('click', function() {
                    const selectedColor = this.getAttribute('data-color');
                    colorPicker.value = selectedColor;
                    
                    // Update visual selection
                    presetColors.forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
            
            // Handle custom color picker change
            colorPicker.addEventListener('change', function() {
                // Remove selection from preset colors when custom color is chosen
                presetColors.forEach(c => c.classList.remove('selected'));
            });
            
            // Set initial selection
            const initialColor = colorPicker.value;
            const initialPreset = presetColorContainers[index].querySelector(`[data-color="${initialColor}"]`);
            if (initialPreset) {
                initialPreset.classList.add('selected');
            }
        }
    });
}

// Initialize color pickers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeColorPickers();
});

// Re-initialize color pickers when modals are shown
document.addEventListener('modalShown', function() {
    initializeColorPickers();
});
