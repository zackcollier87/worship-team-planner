/*
 * Simple script for managing rehearsal schedule entries using localStorage.
 * Users can add dates and notes which will be stored locally in the browser.
 * Optional Firebase support allows syncing data online if configured.
 */

// --- Firebase Setup (optional) ---
let useFirestore = false;
let db;
if (typeof firebase !== 'undefined') {
    const firebaseConfig = {
        apiKey: 'PASTE_YOUR_API_KEY',
        authDomain: 'YOUR_PROJECT.firebaseapp.com',
        projectId: 'YOUR_PROJECT',
    };
    if (firebaseConfig.apiKey !== 'PASTE_YOUR_API_KEY') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        useFirestore = true;
    }
}

// Grab elements
const scheduleForm = document.getElementById('schedule-form');
const dateInput = document.getElementById('date-input');
const notesInput = document.getElementById('notes-input');
const scheduleList = document.getElementById('schedule-list');

// Retrieve stored schedule from localStorage
async function loadSchedule() {
    if (useFirestore) {
        const snapshot = await db.collection('schedule').get();
        const entries = [];
        snapshot.forEach(doc => entries.push(doc.data()));
        return entries;
    }
    const stored = localStorage.getItem('worship_schedule');
    return stored ? JSON.parse(stored) : [];
}

// Save schedule to localStorage
async function saveSchedule(entries) {
    if (useFirestore) {
        const col = db.collection('schedule');
        const snapshot = await col.get();
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        entries.forEach(entry => batch.set(col.doc(), entry));
        await batch.commit();
        return;
    }
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
        deleteBtn.addEventListener('click', async () => {
            entries.splice(index, 1);
            await saveSchedule(entries);
            renderSchedule(entries);
        });
        li.appendChild(deleteBtn);
        scheduleList.appendChild(li);
    });
}

// Initialize schedule on page load
document.addEventListener('DOMContentLoaded', async () => {
    const entries = await loadSchedule();
    renderSchedule(entries);

    // Initialize event & setlist data
    eventsData = await loadEvents();
    renderEvents();
});

// Handle form submission
scheduleForm.addEventListener('submit', async event => {
    event.preventDefault();
    const date = dateInput.value;
    const notes = notesInput.value.trim();
    if (!date || !notes) return;
    const entries = await loadSchedule();
    entries.push({ date, notes });
    await saveSchedule(entries);
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

async function loadEvents() {
    if (useFirestore) {
        const snapshot = await db.collection('events').get();
        const events = [];
        snapshot.forEach(doc => events.push(doc.data()));
        return events;
    }
    const stored = localStorage.getItem('worship_events');
    return stored ? JSON.parse(stored) : [];
}
async function saveEvents(events) {
    if (useFirestore) {
        const col = db.collection('events');
        const snap = await col.get();
        const batch = db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        events.forEach(evt => batch.set(col.doc(), evt));
        await batch.commit();
        return;
    }
    localStorage.setItem('worship_events', JSON.stringify(events));
}

function renderEvents() {
    eventListEl.innerHTML = '';
    eventsData.forEach((evt, index) => {
        const li = document.createElement('li');
        li.textContent = `${evt.name} (${evt.date})`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', async () => {
            currentEventIndex = index;
            setlistManager.style.display = '';
            songManager.style.display = 'none';
            currentEventNameEl.textContent = evt.name;
            currentSetlistIndex = null;
            await renderSetlists();
        });
        eventListEl.appendChild(li);
    });
}

async function renderSetlists() {
    setlistListEl.innerHTML = '';
    if (currentEventIndex === null) return;
    const evt = eventsData[currentEventIndex];
    evt.setlists = evt.setlists || [];
    evt.setlists.forEach((sl, index) => {
        const li = document.createElement('li');
        li.textContent = sl.name;
        li.style.cursor = 'pointer';
        li.addEventListener('click', async () => {
            currentSetlistIndex = index;
            songManager.style.display = '';
            currentSetlistNameEl.textContent = sl.name;
            await renderSongs();
        });
        setlistListEl.appendChild(li);
    });
    await saveEvents(eventsData);
}

async function renderSongs() {
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
    await saveEvents(eventsData);
}

// Add event
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = eventNameInput.value.trim();
    const date = eventDateInput.value;
    if (!name || !date) return;
    eventsData.push({ name, date, setlists: [] });
    await saveEvents(eventsData);
    renderEvents();
    eventNameInput.value = '';
    eventDateInput.value = '';
});

// Add setlist
setlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentEventIndex === null) return;
    const name = setlistNameInput.value.trim();
    if (!name) return;
    eventsData[currentEventIndex].setlists.push({ name, songs: [] });
    await saveEvents(eventsData);
    renderSetlists();
    setlistNameInput.value = '';
});

// Add song
songForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentEventIndex === null || currentSetlistIndex === null) return;
    const title = songTitleInput.value.trim();
    const youtube = songYoutubeInput.value.trim();
    const file = songPdfInput.files[0];
    if (!title || !file) return;
    const reader = new FileReader();
    reader.onload = async function(evt) {
        const pdfData = evt.target.result;
        const song = { title, pdfData, youtube: youtube || null };
        const setlist = eventsData[currentEventIndex].setlists[currentSetlistIndex];
        setlist.songs = setlist.songs || [];
        setlist.songs.push(song);
        await saveEvents(eventsData);
        await renderSongs();
        songTitleInput.value = '';
        songPdfInput.value = '';
        songYoutubeInput.value = '';
    };
    reader.readAsDataURL(file);
});
