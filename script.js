function updateClock() {
    const now = new Date();

    // Get current hours, minutes, and seconds
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    // Update the clock elements with the current time
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}
// Call updateClock function every 1000ms (1 second)
setInterval(updateClock, 1000);

// Initial call to ensure the clock starts immediately when the page loads
updateClock();
function updateClock() {
    const now = new Date();

    // Clock
    document.getElementById("hours").textContent = now.getHours().toString().padStart(2, "0");
    document.getElementById("minutes").textContent = now.getMinutes().toString().padStart(2, "0");
    document.getElementById("seconds").textContent = now.getSeconds().toString().padStart(2, "0");

    // Date
    document.getElementById("day").textContent = now.getDate().toString().padStart(2, "0");
    document.getElementById("month").textContent = (now.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-based
    document.getElementById("year").textContent = now.getFullYear();
}

updateClock();
setInterval(updateClock, 1000);
function updateClock() {
    const now = new Date();

    // Clock
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;

    // Date
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[now.getDay()];
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const year = now.getFullYear();

    const fullDate = `${dayName}, ${day}/${month}/${year}`;
    document.getElementById("dateDisplay").textContent = fullDate;
}

updateClock();
setInterval(updateClock, 1000);

