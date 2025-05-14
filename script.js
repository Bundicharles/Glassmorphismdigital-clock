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
        void el.offsetWidth;
        el.textContent = newValue;
        el.classList.add("animate");
    }
}

function saveNote() {
    const note = document.getElementById("diaryInput").value.trim();
    if (note) {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];
        const noteKey = `note_${date}_${time}`;
        const noteWithTime = `${time} - ${note}`;

        localStorage.setItem(noteKey, noteWithTime);

        document.getElementById("savedStatus").textContent = "Note saved!";
        document.getElementById("diaryInput").value = '';
    }
}

function viewSavedHistory(selectedDate = null) {
    const notesHistoryContainer = document.getElementById("notesHistory");
    notesHistoryContainer.innerHTML = '';

    const notes = [];

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('note_')) {
            const [_, date, time] = key.split('_');
            if (!selectedDate || selectedDate === date) {
                notes.push({ key, date, time, content: localStorage.getItem(key) });
            }
        }
    });

    notes.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

    if (notes.length > 0) {
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-item');
            noteElement.innerHTML = `
                <strong>${note.date} ${note.time}</strong>:<br>
                <p>${note.content}</p>
                <button onclick="deleteNote('${note.key}')">Delete</button>
                <hr>
            `;
            notesHistoryContainer.appendChild(noteElement);
        });
    } else {
        notesHistoryContainer.innerHTML = '<p>No saved notes available for this date.</p>';
    }
}

function deleteNote(key) {
    if (confirm("Are you sure you want to delete this note?")) {
        localStorage.removeItem(key);
        viewSavedHistory(document.getElementById("dateFilter").value); // Refresh view
    }
}

window.onload = function () {
    updateClock();
    setInterval(updateClock, 1000);
    viewSavedHistory(); // Show all notes initially
};
