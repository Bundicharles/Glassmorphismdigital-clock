let alarms = [];
const alarmSound = document.getElementById("alarmSound"); // This assumes <audio id="alarmSound" src="alarm.mp3"></audio>

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
  const fullDate = `${day}/${month}/${year} (${dayName})`;
  document.getElementById("dateDisplay").textContent = fullDate;

  checkReminders(now);
  checkAlarms(); // check alarms every second
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
  const content = document.getElementById("diaryInput").value.trim();
  if (!content) return;

  const now = new Date();
  const savedAt = formatDate(now);
  const key = `note_${Date.now()}`;
  const note = { content, savedAt };

  localStorage.setItem(key, JSON.stringify(note));
  document.getElementById("savedStatus").textContent = "📝 Note saved!";
  document.getElementById("diaryInput").value = "";
  viewSavedHistory();
}

function saveFutureEvent() {
  const eventContent = document.getElementById("diaryInput").value.trim();
  const futureDate = prompt("Enter date for this event (DD/MM/YYYY):");
  const reminderTime = prompt("Enter reminder time (HH:MM):");

  if (eventContent && futureDate && reminderTime) {
    const key = `future_${Date.now()}`;
    const futureEvent = {
      content: eventContent,
      futureDate,
      reminderTime,
      savedAt: formatDate(new Date())
    };

    localStorage.setItem(key, JSON.stringify(futureEvent));
    document.getElementById("savedStatus").textContent = "📅 Future event saved!";
    document.getElementById("diaryInput").value = "";
    viewSavedHistory();
  }
}

function viewSavedHistory(filterDate = null) {
  const container = document.getElementById("notesHistory");
  container.innerHTML = '';
  const notes = [];

  Object.keys(localStorage).forEach(key => {
    const value = JSON.parse(localStorage.getItem(key));
    if (key.startsWith("note_") || key.startsWith("future_")) {
      const [type] = key.split('_');
      notes.push({
        type,
        savedAt: value.savedAt || formatDate(new Date()),
        futureDate: value.futureDate || '',
        reminderTime: value.reminderTime || '',
        content: value.content,
        key
      });
    }
  });

  notes.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));

  if (notes.length === 0) {
    container.innerHTML = '<p>No saved notes or events found.</p>';
    return;
  }

  notes.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note-item");
    div.innerHTML = `
      <strong>${note.type === 'future' ? "📅 Future Event" : "📝 Note"}:</strong><br>
      <strong>Saved at: ${note.savedAt}</strong><br>
      <p>${note.content}</p>
      ${note.type === 'future' ? `<strong>Reminder: ${note.futureDate} at ${note.reminderTime}</strong><br>` : ""}
      <button onclick="deleteNote('${note.key}')">Delete</button>
      <hr>
    `;
    container.appendChild(div);
  });
}

function deleteNote(key) {
  if (confirm("Delete this entry?")) {
    localStorage.removeItem(key);
    viewSavedHistory();
  }
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function checkReminders(currentDate) {
  const currentTime = `${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("future_")) {
      const event = JSON.parse(localStorage.getItem(key));
      if (event.reminderTime === currentTime) {
        sendNotification(event.content);
      }
    }
  });
}

function sendNotification(content) {
  if (Notification.permission === "granted") {
    new Notification("Reminder: " + content);
  }
}

function addAlarm() {
  const timeInput = document.getElementById("alarmTime").value;
  if (!timeInput) return alert("Please select a time.");

  if (alarms.includes(timeInput)) {
    alert("Alarm already set for this time.");
    return;
  }

  alarms.push(timeInput);
  renderAlarms();
  alert(`Alarm set for ${timeInput}`);
}

function renderAlarms() {
  const alarmList = document.getElementById("alarmList");
  alarmList.innerHTML = '';

  alarms.forEach((time, index) => {
    const li = document.createElement("li");
    li.textContent = time;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => {
      alarms.splice(index, 1);
      renderAlarms();
    };
    li.appendChild(removeBtn);
    alarmList.appendChild(li);
  });
}

function checkAlarms() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  alarms.forEach((alarmTime, i) => {
    if (alarmTime === currentTime) {
      showAlarmNotification(alarmTime);
      alarms.splice(i, 1); // remove after trigger
      renderAlarms();
    }
  });
}

function showAlarmNotification(time) {
  playAlarmSound(); // 🔊 Play sound

  if (Notification.permission === "granted") {
    new Notification("⏰ Alarm!", {
      body: `It's ${time}`,
      icon: "alarm-icon.png",
      vibrate: [200, 100, 200],
    });
  } else {
    console.warn("Notification permission not granted.");
  }
}

function playAlarmSound() {
  if (!alarmSound) return;

  alarmSound.currentTime = 0;
  alarmSound.play().catch(e => console.warn("Alarm sound failed to play:", e));

  setTimeout(() => {
    alarmSound.pause();
    alarmSound.currentTime = 0;
  }, 15000); // 15 seconds
}

window.onload = function () {
  updateClock();
  setInterval(updateClock, 1000); // Also runs checkAlarms inside
  viewSavedHistory();

  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service worker registered.', reg))
    .catch(err => console.error('Service worker registration failed:', err));
}
