// FocusFlow App Logic

// State Management
let tasks = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');

// Helper to escape HTML characters (XSS Prevention)
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Format date into human-friendly string (e.g., "Jul 12, 8:05 PM")
function formatTimestamp(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  
  const options = { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  
  return date.toLocaleDateString('en-US', options);
}

// Load tasks from localStorage
function loadTasks() {
  const stored = localStorage.getItem('focusflow_tasks');
  if (stored) {
    try {
      tasks = JSON.parse(stored);
      // Clean up any lingering edit states on load
      tasks.forEach(t => t.isEditing = false);
    } catch (e) {
      console.error("Error parsing tasks from localStorage", e);
      tasks = [];
    }
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
}

// Add a new task
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    text: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    isEditing: false
  };

  tasks.unshift(newTask); // Prepend new task to list
  saveTasks();
  render();
}

// Animate a task card first, then execute structural updates
function animateAndExecute(id, action) {
  const cardElement = document.querySelector(`[data-id="${id}"]`);
  if (cardElement) {
    cardElement.classList.add('deleting');
    // Listen for animation finish
    cardElement.addEventListener('animationend', () => {
      action();
    }, { once: true });
  } else {
    action();
  }
}

// Toggle task completion
function toggleTask(id) {
  animateAndExecute(id, () => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      // If task is completed, cancel any open edit state
      if (task.completed) {
        task.isEditing = false;
      }
      saveTasks();
      render();
    }
  });
}

// Delete a task
function deleteTask(id) {
  animateAndExecute(id, () => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  });
}

// Start Editing Mode
function startEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (task && !task.completed) {
    // Cancel other edit states first
    tasks.forEach(t => t.isEditing = false);
    task.isEditing = true;
    render();
  }
}

// Save Edit Input
function saveEdit(id) {
  const task = tasks.find(t => t.id === id);
  const inputElement = document.getElementById(`edit-input-${id}`);
  if (task && inputElement) {
    const newText = inputElement.value.trim();
    if (newText) {
      task.text = newText;
      task.isEditing = false;
      saveTasks();
      render();
    } else {
      // If user clears the input completely, delete the task
      deleteTask(id);
    }
  }
}

// Cancel Editing Mode
function cancelEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.isEditing = false;
    render();
  }
}

// Render the application interface
function render() {
  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  // Update counters
  pendingCount.textContent = `${pending.length} pending`;
  completedCount.textContent = `${completed.length} completed`;

  // Render Pending List
  if (pending.length === 0) {
    pendingList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <p class="empty-state-title">No pending tasks</p>
        <p class="empty-state-desc">You're all caught up! Time to take a breather ☕</p>
      </div>
    `;
  } else {
    pendingList.innerHTML = pending.map(task => {
      if (task.isEditing) {
        return `
          <li class="task-card pending-card editing-card" data-id="${task.id}">
            <div class="edit-input-wrapper">
              <input type="text" class="edit-input" id="edit-input-${task.id}" value="${escapeHTML(task.text)}" aria-label="Edit task description">
              <button class="btn-action btn-save" aria-label="Save edit" onclick="saveEdit('${task.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <button class="btn-action btn-cancel" aria-label="Cancel edit" onclick="cancelEdit('${task.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </li>
        `;
      } else {
        return `
          <li class="task-card pending-card" data-id="${task.id}">
            <div class="checkbox-wrapper">
              <button class="btn-check" aria-label="Mark Complete" onclick="toggleTask('${task.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
            <div class="task-content">
              <span class="task-text">${escapeHTML(task.text)}</span>
              <div class="task-meta">
                <span class="meta-created">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Added: ${formatTimestamp(task.createdAt)}
                </span>
              </div>
            </div>
            <div class="task-actions">
              <button class="btn-action btn-edit" aria-label="Edit task" onclick="startEdit('${task.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-action btn-delete" aria-label="Delete task" onclick="deleteTask('${task.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </li>
        `;
      }
    }).join('');
  }

  // Render Completed List
  if (completed.length === 0) {
    completedList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        </div>
        <p class="empty-state-title">No completed tasks yet</p>
        <p class="empty-state-desc">Select complete to clear tasks off your list! 💪</p>
      </div>
    `;
  } else {
    completedList.innerHTML = completed.map(task => {
      return `
        <li class="task-card completed-card" data-id="${task.id}">
          <div class="checkbox-wrapper">
            <button class="btn-check" aria-label="Mark Pending" onclick="toggleTask('${task.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
          <div class="task-content">
            <span class="task-text">${escapeHTML(task.text)}</span>
            <div class="task-meta">
              <span class="meta-created">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Added: ${formatTimestamp(task.createdAt)}
              </span>
              <span class="meta-completed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Completed: ${formatTimestamp(task.completedAt)}
              </span>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-action btn-delete" aria-label="Delete task" onclick="deleteTask('${task.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </li>
      `;
    }).join('');
  }

  // Setup event listeners for the inline inputs that were just rendered
  document.querySelectorAll('.edit-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      const taskId = input.id.replace('edit-input-', '');
      if (e.key === 'Enter') {
        saveEdit(taskId);
      } else if (e.key === 'Escape') {
        cancelEdit(taskId);
      }
    });
  });

  // Focus the editing input and move cursor to the end
  const activeEditInput = document.querySelector('.edit-input');
  if (activeEditInput) {
    activeEditInput.focus();
    const len = activeEditInput.value.length;
    activeEditInput.setSelectionRange(len, len);
  }
}

// Handle Task Form Submit
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value;
  addTask(text);
  taskInput.value = '';
});

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  render();
});

// Expose necessary toggles to window scope for inline HTML handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.startEdit = startEdit;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;
