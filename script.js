// ---------------------------
// Clock
// ---------------------------
function updateClock() {
  const now = new Date();
  document.getElementById("hours").textContent = String(now.getHours()).padStart(2, "0");
  document.getElementById("minutes").textContent = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("seconds").textContent = String(now.getSeconds()).padStart(2, "0");

  const dateString = now.toISOString().slice(0, 10);
  document.getElementById("dateDisplay").textContent = dateString;
}
setInterval(updateClock, 1000);
updateClock();

// ---------------------------
// Save Note
// ---------------------------
function saveNote() {
  const content = document.getElementById("diaryInput").value.trim();
  if (!content) return alert("Please write a note.");

  const savedAt = new Date().toISOString().slice(0, 10);
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

  const eventDate = prompt("Enter event date (YYYY-MM-DD):");
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
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(new Date(dateString));
}

// ---------------------------
// View All Notes and Events by Date Filter
// ---------------------------
function viewSavedHistory() {
  const date = document.getElementById("dateFilter").value;
  if (!date || !isValidDate(date)) {
    alert("Please select a valid date to view history.");
    return;
  }

  const container = document.getElementById("notesHistory");
  container.style.display = "block";
  container.innerHTML = `<button onclick="document.getElementById('notesHistory').style.display='none'">Close</button>`;

  let foundAny = false;

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("note_") || key.startsWith("future_")) {
      try {
        const entry = JSON.parse(localStorage.getItem(key));
        let entryDate = key.startsWith("note_") ? entry.savedAt : entry.eventDate;
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

// Twinkle effect for 30 seconds

// Play alarm sound repeatedly for 30 seconds with twinkle effect
function playAlarmNotification() {
  if (!alarmSound.src) {
    alert("Please upload a custom alarm sound!");
    return;
  }

  alarmSound.currentTime = 0;
  alarmSound.play();

  const duration = 30000; // 30 seconds
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

  // Schedule regular alarms
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

  // Schedule future event alarms
  scheduleFutureEventAlarms();
}

function scheduleFutureEventAlarms() {
  const now = new Date();

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("future_")) {
      try {
        const event = JSON.parse(localStorage.getItem(key));
        if (!event.eventDate || !event.eventTime) return;

        const [hour, minute] = event.eventTime.split(":").map(Number);
        const eventDateTime = new Date(event.eventDate);
        eventDateTime.setHours(hour, minute, 0, 0);

        if (eventDateTime < now) return; // Skip past events

        const timeout = eventDateTime.getTime() - now.getTime();

        const timeoutId = setTimeout(() => {
          playAlarmNotification();
          showNotification("Event Reminder", `Event: ${event.content} at ${event.eventTime}`);
        }, timeout);

        alarmTimeouts.push(timeoutId);
      } catch (e) {
        console.error("Error scheduling future event alarm:", e);
      }
    }
  });
}

// ---------------------------
// Notifications Permission Request
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
// Initialize on page load
// ---------------------------
window.onload = () => {
  loadAlarms();
};
