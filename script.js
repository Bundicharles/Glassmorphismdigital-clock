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
        const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format
        localStorage.setItem(`note_${currentDate}`, note);  // Save note with the current date as the key
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

window.onload = function () {
    updateClock();
    setInterval(updateClock, 1000);  // Update the clock every second
    loadPreviousNote();  // Load the note for the current day when the page loads
};
