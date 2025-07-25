# worship-team-planner
A simple planner web app for a worship team and discipleship hub.

## Features

- **Rehearsal Schedule** – track upcoming rehearsal dates and notes. Entries are stored in your browser's `localStorage` so they persist across page reloads.
- **Event & Setlist Manager** – create events, build setlists for each event and attach song PDFs or YouTube links.
- **Resource Links** – quick access to free online worship and discipleship material.

## Usage

1. Clone or download this repository.
2. Open `index.html` in your browser – no server is required.
3. Use the **Schedule** form to add rehearsal dates and notes.
4. In the **Events** section, create events and setlists, then upload song PDFs (stored locally in your browser) and optional YouTube links.

All data is saved to your browser only by default. Clearing browser data will remove your schedule, events and songs.

## Optional Online Storage

You can sync data to a free [Firebase](https://firebase.google.com/) project:

1. Create a Firebase project and enable **Firestore** in test mode.
2. Copy the project's configuration snippet and replace the placeholders in `script.js` (`firebaseConfig` object).
3. Reload the page. If Firebase credentials are present, data will be saved to Firestore instead of `localStorage`.

The Firebase Spark plan has generous limits that should be enough for small teams. Be sure to secure your Firestore rules before going to production.
