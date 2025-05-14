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
        void el.offsetWidth; // reflow trick
        el.textContent = newValue;
        el.classList.add("animate");
    }
}

function saveDiary() {
    const note = document.getElementById("diaryInput").value;
    localStorage.setItem("dailyNote", note);
    document.getElementById("savedStatus").textContent = "Note saved!";
    setTimeout(() => {
        document.getElementById("savedStatus").textContent = "";
    }, 2000);
}

function loadDiary() {
    const savedNote = localStorage.getItem("dailyNote");
    if (savedNote) {
        document.getElementById("diaryInput").value = savedNote;
    }
}

updateClock();
loadDiary();
setInterval(updateClock, 1000);
