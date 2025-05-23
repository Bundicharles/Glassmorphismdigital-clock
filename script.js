// ---------------------------
// Clock
// ---------------------------
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;

  const dateString = formatDate(now);
  document.getElementById("dateDisplay").textContent = dateString;
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(dateString) {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
}

setInterval(updateClock, 1000);
updateClock();

// ---------------------------
// Save Note
// ---------------------------
function saveNote() {
  const content = document.getElementById("diaryInput").value.trim();
  if (!content) return alert("Please write a note.");

  const savedAt = formatDate(new Date());
  const key = `note_${Date.now()}`;
  const note = { content, savedAt };

  localStorage.setItem(key, JSON.stringify(note));
  showSavedMessage("Note saved successfully!");
  document.getElementById("diaryInput").value = "";
}

// ---------------------------
// Save Future Event
// ---------------------------
function saveFutureEvent() {
  const content = document.getElementById("diaryInput").value.trim();
  if (!content) return alert("Please write a future event.");

  const eventDate = prompt("Enter event date (DD/MM/YYYY):");
  if (!eventDate || !isValidDate(eventDate)) return alert("Invalid date.");

  const eventTime = prompt("Enter event time (HH:MM):");
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(eventTime)) return alert("Invalid time.");

  const key = `future_${Date.now()}`;
  const eventObj = { content, eventDate, eventTime };

  localStorage.setItem(key, JSON.stringify(eventObj));
  showSavedMessage("Future event saved successfully!");
  document.getElementById("diaryInput").value = "";
}

function showSavedMessage(msg) {
  const status = document.getElementById("savedStatus");
  status.textContent = msg;
  setTimeout(() => status.textContent = "", 3000);
}

function isValidDate(dateString) {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  const [d, m, y] = dateString.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  return date && date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// ---------------------------
// View Saved Notes/Events
// ---------------------------
function viewSavedHistory() {
  const rawDate = document.getElementById("dateFilter").value;

  // Convert from YYYY-MM-DD to DD/MM/YYYY
  if (!rawDate) {
    alert("Please select a date.");
    return;
  }

  const [year, month, day] = rawDate.split("-");
  const date = `${day}/${month}/${year}`;

  if (!isValidDate(date)) {
    alert("Invalid date format.");
    return;
  }

  // Proceed using the converted `date` in DD/MM/YYYY format
  const container = document.getElementById("notesHistory");
  container.style.display = "block";
  container.innerHTML = `<button onclick="document.getElementById('notesHistory').style.display='none'">Close</button>`;

  let foundAny = false;

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("note_") || key.startsWith("future_")) {
      try {
        const entry = JSON.parse(localStorage.getItem(key));
        const entryDate = key.startsWith("note_") ? entry.savedAt : entry.eventDate;
        if (entryDate === date) {
          foundAny = true;
          const div = document.createElement("div");
          div.classList.add("note-item");
          div.style.padding = "10px";
          div.style.borderBottom = "1px solid #ccc";
          div.style.marginBottom = "10px";

          div.innerHTML = `
            <strong>${key.startsWith("note_") ? "📝 Note" : "📅 Future Event"}</strong><br>
            <p>${entry.content}</p>
            <small>
              ${key.startsWith("note_") ? `Saved At: ${entry.savedAt}` : `Event Date: ${entry.eventDate} ${entry.eventTime}`}
            </small><br>
            <button onclick="deleteEntry('${key}')">Delete</button>
          `;
          container.appendChild(div);
        }
      } catch (e) {
        console.error(`Error parsing item for key ${key}:`, e);
      }
    }
  });

  if (!foundAny) {
    container.innerHTML += `<p>No notes or future events found for ${date}.</p>`;
  }
}

function deleteEntry(key) {
  if (confirm("Delete this entry?")) {
    localStorage.removeItem(key);
    viewSavedHistory();
  }
}

// ---------------------------
// Alarm Sound Upload & Control
// ---------------------------
const alarmSound = document.getElementById("alarmSound");
let twinkleInterval = null;
let alarmTimeouts = [];

document.getElementById("customSoundInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const fileURL = URL.createObjectURL(file);
    alarmSound.src = fileURL;
  }
});

function startTwinkleEffect() {
  const clockContainer = document.querySelector(".clock-container");
  if (!clockContainer) return;

  const colors = ["#00ff66", "#ff0066", "#6600ff", "#ffcc00", "#00ccff"];
  let i = 0;

  twinkleInterval = setInterval(() => {
    clockContainer.style.backgroundColor = colors[i];
    i = (i + 1) % colors.length;
  }, 500);
}

function stopTwinkleEffect() {
  const clockContainer = document.querySelector(".clock-container");
  if (!clockContainer) return;
  clearInterval(twinkleInterval);
  twinkleInterval = null;
  clockContainer.style.backgroundColor = "";
}

function playAlarmNotification() {
  if (!alarmSound.src) {
    alert("Please upload a custom alarm sound!");
    return;
  }

  alarmSound.currentTime = 0;
  alarmSound.play();

  const duration = 30000;
  const repeatInterval = alarmSound.duration * 1000 || 3000;

  let elapsed = 0;

  function repeatSound() {
    if (elapsed < duration) {
      alarmSound.currentTime = 0;
      alarmSound.play();
      elapsed += repeatInterval;
      const timeoutId = setTimeout(repeatSound, repeatInterval);
      alarmTimeouts.push(timeoutId);
    }
  }

  repeatSound();
  startTwinkleEffect();

  setTimeout(() => {
    alarmSound.pause();
    stopTwinkleEffect();
    alarmTimeouts.forEach(clearTimeout);
    alarmTimeouts = [];
  }, duration);
}

// ---------------------------
// Alarms (Regular and Future Events)
// ---------------------------
let alarms = [];
let triggeredEventKeys = new Set();

function addAlarm() {
  const alarmTime = document.getElementById("alarmTime").value;
  if (!alarmTime) return alert("Select a valid alarm time.");

  alarms.push(alarmTime);
  localStorage.setItem("alarms", JSON.stringify(alarms));
  alert(`Alarm set for ${alarmTime}`);
  document.getElementById("alarmTime").value = "";
  renderAlarms();
  scheduleAlarms();
}

function renderAlarms() {
  const list = document.getElementById("alarmsList");
  list.innerHTML = "";
  alarms.forEach((time, index) => {
    const li = document.createElement("li");
    li.textContent = time + " ";
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      alarms.splice(index, 1);
      localStorage.setItem("alarms", JSON.stringify(alarms));
      renderAlarms();
      scheduleAlarms();
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function loadAlarms() {
  const saved = localStorage.getItem("alarms");
  if (saved) alarms = JSON.parse(saved);
  renderAlarms();
  scheduleAlarms();
}

function scheduleAlarms() {
  alarmTimeouts.forEach(t => clearTimeout(t));
  alarmTimeouts = [];

  const now = new Date();

  alarms.forEach(timeStr => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const alarmDate = new Date();
    alarmDate.setHours(hour, minute, 0, 0);
    if (alarmDate < now) alarmDate.setDate(alarmDate.getDate() + 1);

    const timeout = alarmDate.getTime() - now.getTime();
    const id = setTimeout(() => {
      playAlarmNotification();
      showNotification("Alarm", `Alarm ringing for ${timeStr}`);
    }, timeout);

    alarmTimeouts.push(id);
  });
}

// ---------------------------
// Future Event Alarm Checker
// ---------------------------
function scheduleFutureEventAlarms() {
  setInterval(() => {
    const now = new Date();

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("future_") && !triggeredEventKeys.has(key)) {
        try {
          const event = JSON.parse(localStorage.getItem(key));
          if (!event.eventDate || !event.eventTime) return;

          const [hour, minute] = event.eventTime.split(":").map(Number);
          const [day, month, year] = event.eventDate.split("/").map(Number);

          const eventDateTime = new Date();
          eventDateTime.setFullYear(year, month - 1, day);
          eventDateTime.setHours(hour, minute, 0, 0);

          const diff = eventDateTime - now;

          if (diff >= 0 && diff <= 60000) {
            triggeredEventKeys.add(key);
            playAlarmNotification();
            showNotification("⏰ Future Event Reminder", `Event: "${event.content}" at ${event.eventTime}`);
          }
        } catch (e) {
          console.error("Error parsing future event:", e);
        }
      }
    });
  }, 10000);
}

// ---------------------------
// Notifications
// ---------------------------
if ("Notification" in window) {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

// ---------------------------
// Service Worker & PWA Install
// ---------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(console.error);
  });
}

let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  installBtn.style.display = 'none';
});

// ---------------------------
// Initialize
// ---------------------------
window.onload = () => {
  loadAlarms();
  scheduleFutureEventAlarms();
};
