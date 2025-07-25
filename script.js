/*
 * Simple script for managing rehearsal schedule entries using localStorage.
 * Users can add dates and notes which will be stored locally in the browser.
 */

// Grab elements
const scheduleForm = document.getElementById('schedule-form');
const dateInput = document.getElementById('date-input');
const notesInput = document.getElementById('notes-input');
const scheduleList = document.getElementById('schedule-list');

// Retrieve stored schedule from localStorage
function loadSchedule() {
    const stored = localStorage.getItem('worship_schedule');
    return stored ? JSON.parse(stored) : [];
}

// Save schedule to localStorage
function saveSchedule(entries) {
    localStorage.setItem('worship_schedule', JSON.stringify(entries));
}

// Render the schedule list in the UI
function renderSchedule(entries) {
    // Clear existing list
    scheduleList.innerHTML = '';
    entries.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${entry.date} - ${entry.notes}`;
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete';
        deleteBtn.addEventListener('click', () => {
            entries.splice(index, 1);
            saveSchedule(entries);
            renderSchedule(entries);
        });
        li.appendChild(deleteBtn);
        scheduleList.appendChild(li);
    });
}

// Initialize schedule on page load
document.addEventListener('DOMContentLoaded', () => {
    const entries = loadSchedule();
    renderSchedule(entries);
});

// Handle form submission
scheduleForm.addEventListener('submit', event => {
    event.preventDefault();
    const date = dateInput.value;
    const notes = notesInput.value.trim();
    if (!date || !notes) return;
    const entries = loadSchedule();
    entries.push({ date, notes });
    saveSchedule(entries);
    renderSchedule(entries);
    // Clear inputs
    dateInput.value = '';
    notesInput.value = '';
});
