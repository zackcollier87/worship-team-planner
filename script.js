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

    // Initialize event & setlist data
    eventsData = loadEvents();
    renderEvents();
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

/* ==================== Event & Setlist Manager ==================== */
// Elements for events and setlists
const eventForm = document.getElementById('event-form');
const eventNameInput = document.getElementById('event-name');
const eventDateInput = document.getElementById('event-date');
const eventListEl = document.getElementById('event-list');
const setlistManager = document.getElementById('setlist-manager');
const currentEventNameEl = document.getElementById('current-event-name');
const setlistForm = document.getElementById('setlist-form');
const setlistNameInput = document.getElementById('setlist-name');
const setlistListEl = document.getElementById('setlist-list');
const songManager = document.getElementById('song-manager');
const currentSetlistNameEl = document.getElementById('current-setlist-name');
const songForm = document.getElementById('song-form');
const songTitleInput = document.getElementById('song-title');
const songPdfInput = document.getElementById('song-pdf');
const songYoutubeInput = document.getElementById('song-youtube');
const songListEl = document.getElementById('song-list');

let eventsData = [];
let currentEventIndex = null;
let currentSetlistIndex = null;

function loadEvents() {
    const stored = localStorage.getItem('worship_events');
    return stored ? JSON.parse(stored) : [];
}
function saveEvents(events) {
    localStorage.setItem('worship_events', JSON.stringify(events));
}

function renderEvents() {
    eventListEl.innerHTML = '';
    eventsData.forEach((evt, index) => {
        const li = document.createElement('li');
        li.textContent = `${evt.name} (${evt.date})`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            currentEventIndex = index;
            setlistManager.style.display = '';
            songManager.style.display = 'none';
            currentEventNameEl.textContent = evt.name;
            currentSetlistIndex = null;
            renderSetlists();
        });
        eventListEl.appendChild(li);
    });
}

function renderSetlists() {
    setlistListEl.innerHTML = '';
    if (currentEventIndex === null) return;
    const evt = eventsData[currentEventIndex];
    evt.setlists = evt.setlists || [];
    evt.setlists.forEach((sl, index) => {
        const li = document.createElement('li');
        li.textContent = sl.name;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            currentSetlistIndex = index;
            songManager.style.display = '';
            currentSetlistNameEl.textContent = sl.name;
            renderSongs();
        });
        setlistListEl.appendChild(li);
    });
    saveEvents(eventsData);
}

function renderSongs() {
    songListEl.innerHTML = '';
    if (currentEventIndex === null || currentSetlistIndex === null) return;
    const songs = eventsData[currentEventIndex].setlists[currentSetlistIndex].songs || [];
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title + ' ';
        // PDF view button
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View PDF';
        viewBtn.addEventListener('click', () => {
            const pdfWindow = window.open('');
            pdfWindow.document.write(`<embed src="${song.pdfData}" type="application/pdf" width="100%" height="100%">`);
        });
        li.appendChild(viewBtn);
        // YouTube link if exists
        if (song.youtube) {
            const yLink = document.createElement('a');
            yLink.href = song.youtube;
            yLink.target = '_blank';
            yLink.textContent = 'YouTube';
            yLink.style.marginLeft = '0.5rem';
            li.appendChild(yLink);
        }
        songListEl.appendChild(li);
    });
    saveEvents(eventsData);
}

// Add event
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = eventNameInput.value.trim();
    const date = eventDateInput.value;
    if (!name || !date) return;
    eventsData.push({ name, date, setlists: [] });
    saveEvents(eventsData);
    renderEvents();
    eventNameInput.value = '';
    eventDateInput.value = '';
});

// Add setlist
setlistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentEventIndex === null) return;
    const name = setlistNameInput.value.trim();
    if (!name) return;
    eventsData[currentEventIndex].setlists.push({ name, songs: [] });
    saveEvents(eventsData);
    renderSetlists();
    setlistNameInput.value = '';
});

// Add song
songForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentEventIndex === null || currentSetlistIndex === null) return;
    const title = songTitleInput.value.trim();
    const youtube = songYoutubeInput.value.trim();
    const file = songPdfInput.files[0];
    if (!title || !file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const pdfData = evt.target.result;
        const song = { title, pdfData, youtube: youtube || null };
        const setlist = eventsData[currentEventIndex].setlists[currentSetlistIndex];
        setlist.songs = setlist.songs || [];
        setlist.songs.push(song);
        saveEvents(eventsData);
        renderSongs();
        songTitleInput.value = '';
        songPdfInput.value = '';
        songYoutubeInput.value = '';
    };
    reader.readAsDataURL(file);
});
