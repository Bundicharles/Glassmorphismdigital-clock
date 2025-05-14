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
        const currentDate = new Date();
        const date = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS
        const key = `note_${date}_${time}`;
        const noteWithTime = `${time} - ${note}`;

        localStorage.setItem(key, noteWithTime);
        document.getElementById("savedStatus").textContent = "Note saved!";
        document.getElementById("diaryInput").value = "";
    }
}

function loadPreviousNote() {
    const currentDate = new Date().toISOString().split('T')[0];
    let latestTime = "";
    let latestNote = "";

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`note_${currentDate}_`)) {
            const time = key.split("_")[2];
            if (time > latestTime) {
                latestTime = time;
                latestNote = localStorage.getItem(key);
            }
        }
    });

    if (latestNote) {
        document.getElementById("diaryInput").value = latestNote.split(" - ").slice(1).join(" - ");
    }
}

function viewSavedHistory() {
    const notesHistoryContainer = document.getElementById("notesHistory");
    notesHistoryContainer.innerHTML = '';

    const notes = [];

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('note_')) {
            const [_, date, time] = key.split('_');
            const content = localStorage.getItem(key);
            notes.push({ key, date, time, content });
        }
    });

    notes.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

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
        notesHistoryContainer.innerHTML = '<p>No saved notes history available.</p>';
    }
}

function deleteNote(key) {
    localStorage.removeItem(key);
    viewSavedHistory(); // refresh history
}

function saveFutureEvent() {
    const note = document.getElementById("diaryInput").value.trim();
    const date = document.getElementById("eventDate").value;
    const time = document.getElementById("eventTime").value;

    if (!note) {
        alert("Please enter a note.");
        return;
    }

    if (!date || !time) {
        alert("Please select a date and time.");
        return;
    }

    const key = `event_${date}_${time}`;
    const eventData = { note, notified: false };

    localStorage.setItem(key, JSON.stringify(eventData));
    document.getElementById("savedStatus").textContent = "Future event saved!";
    document.getElementById("diaryInput").value = "";
}

function checkReminders() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("event_")) {
            const [_, date, time] = key.split("_");
            if (date === currentDate && time === currentTime) {
                const eventData = JSON.parse(localStorage.getItem(key));
                if (eventData && !eventData.notified) {
                    alert(`⏰ Reminder: ${eventData.note}`);
                    eventData.notified = true;
                    localStorage.setItem(key, JSON.stringify(eventData));
                }
            }
        }
    });
}

window.onload = function () {
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(checkReminders, 60000); // every 1 min
    loadPreviousNote();
};
