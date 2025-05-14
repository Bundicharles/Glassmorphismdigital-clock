function updateClock() {
    const now = new Date();

    // Format time
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    // Animate only if the time values change
    animateIfChanged("hours", hours);
    animateIfChanged("minutes", minutes);
    animateIfChanged("seconds", seconds);

    // Format date
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[now.getDay()];
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const fullDate = `${dayName}, ${day}/${month}/${year}`;

    document.getElementById("dateDisplay").textContent = fullDate;
}

// Helper function: animate if value changed
function animateIfChanged(id, newValue) {
    const element = document.getElementById(id);
    if (element.textContent !== newValue) {
        element.classList.remove("animate");
        void element.offsetWidth; // force reflow to restart animation
        element.textContent = newValue;
        element.classList.add("animate");
    }
}

// Start clock
updateClock();
setInterval(updateClock, 1000);
