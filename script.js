function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    animateIfChanged("hours", hours);
    animateIfChanged("minutes", minutes);
    animateIfChanged("seconds", seconds);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[now.getDay()];
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const fullDate = `${dayName}, ${day}/${month}/${year}`;
    document.getElementById("dateDisplay").textContent = fullDate;
}

function animateIfChanged(id, newValue) {
    const el = document.getElementById(id);
    if (el.textContent !== newValue) {
        el.classList.remove("animate");
        void el.offsetWidth;  // trigger reflow
        el.textContent = newValue;
        el.classList.add("animate");
    }
}

function saveNote() {
    const note = document.getElementById("diaryInput").value.trim();
    if (note) {
        const currentDate = new Date();
        const date = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS
        const noteWithTime = `${time} - ${note}`; // Combine time and note

        // Save the note with the date as the key
        localStorage.setItem(`note_${date}_${time}`, noteWithTime);
        document.getElementById("savedStatus").textContent = "Note saved!";
    }
}

function loadPreviousNote() {
    const currentDate = new Date().toISOString().split('T')[0];  // Get today's date in YYYY-MM-DD format
    const savedNote = localStorage.getItem(`note_${currentDate}`);  // Retrieve the note for the current date
    if (savedNote) {
        document.getElementById("diaryInput").value = savedNote;  // Load the saved note into the text area
    }
}

function viewSavedHistory() {
    const notesHistoryContainer = document.getElementById("notesHistory");
    notesHistoryContainer.innerHTML = '';  // Clear any previous history displayed

    const notes = [];

    // Iterate over all keys in localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('note_')) {
            const noteDate = key.split('_')[1];  // Extract date part from the key
            const noteTime = key.split('_')[2];  // Extract time part from the key
            const noteContent = localStorage.getItem(key);  // Retrieve the note content
            notes.push({ date: noteDate, time: noteTime, content: noteContent });
        }
    });

    // Sort the notes array by date and time (ascending order)
    notes.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

    if (notes.length > 0) {
        notes.forEach(note => {
            // Create a div to display the note date, time, and content
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-item');
            noteElement.innerHTML = `
                <strong>${note.date} ${note.time}</strong>:<br>
                <p>${note.content}</p>
                <hr>
            `;

            // Append the note to the history container
            notesHistoryContainer.appendChild(noteElement);
        });
    } else {
        notesHistoryContainer.innerHTML = '<p>No saved notes history available.</p>';
    }
}

window.onload = function () {
    updateClock();
    setInterval(updateClock, 1000);  // Update the clock every second
    loadPreviousNote();  // Load the note for the current day when the page loads
};
