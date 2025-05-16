let alarms = [];
let alarmTimeout = null;
let customAlarmSound = null;
let snoozeTimeout = null;
const alarmSoundElement = document.getElementById("alarmSound");

// Clock + Date Update
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
  const date = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  document.getElementById("dateDisplay").textContent = `${date}/${month}/${year} (${dayName})`;

  checkReminders(now);
  checkAlarms(now);
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

// Notes and events saving, viewing, deleting
function saveNote() {
  const content = document.getElementById("diaryInput").value.trim();
  if (!content) return;

  const now = new Date();
  const key = `note_${Date.now()}`;
  const note = {
    content,
    savedAt: formatDate(now)
  };

  localStorage.setItem(key, JSON.stringify(note));
  document.getElementById("savedStatus").textContent = "📝 Note saved!";
  document.getElementById("diaryInput").value = "";
  viewSavedHistory();
}

function saveFutureEvent() {
  const content = document.getElementById("diaryInput").value.trim();
  const futureDate = prompt("Enter event date (DD/MM/YYYY):");
  const reminderTime = prompt("Enter reminder time (HH:MM):");

  if (content && futureDate && reminderTime) {
    const key = `future_${Date.now()}`;
    const event = {
      content,
      futureDate,
      reminderTime,
      savedAt: formatDate(new Date())
    };

    localStorage.setItem(key, JSON.stringify(event));
    document.getElementById("savedStatus").textContent = "📅 Event saved!";
    document.getElementById("diaryInput").value = "";
    viewSavedHistory();
  }
}

function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function viewSavedHistory(filterDate = null) {
  const container = document.getElementById("notesHistory");
  container.innerHTML = '';
  const notes = [];

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("note_") || key.startsWith("future_")) {
      const data = JSON.parse(localStorage.getItem(key));
      const type = key.startsWith("future_") ? "future" : "note";

      if (filterDate) {
        const [year, month, day] = filterDate.split("-");
        const formatted = `${day}/${month}/${year}`;
        if (data.savedAt !== formatted && data.futureDate !== formatted) return;
      }

      notes.push({
        ...data,
        key,
        type
      });
    }
  });

  notes.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));

  if (notes.length === 0) {
    container.innerHTML = "<p>No notes or events.</p>";
    return;
  }

  notes.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note-item");
    div.innerHTML = `
      <strong>${note.type === "future" ? "📅 Event" : "📝 Note"}:</strong><br>
      <strong>Saved: ${note.savedAt}</strong><br>
      <p>${note.content}</p>
      ${note.type === "future" ? `<strong>Reminder: ${note.futureDate} at ${note.reminderTime}</strong><br>` : ""}
      <button onclick="deleteNote('${note.key}')">Delete</button>
      <hr>`;
    container.appendChild(div);
  });
}

function deleteNote(key) {
  if (confirm("Delete this entry?")) {
    localStorage.removeItem(key);
    viewSavedHistory();
  }
}

// Reminders checking
function checkReminders(currentDate) {
  const time = `${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("future_")) {
      const event = JSON.parse(localStorage.getItem(key));
      if (event.reminderTime === time) {
        sendNotification(`Reminder: ${event.content}`);
      }
    }
  });
}

function sendNotification(message) {
  if (Notification.permission === "granted") {
    new Notification(message);
  }
}

// Alarm logic with snooze
function addAlarm() {
  const timeInput = document.getElementById("alarmTime").value;
  if (!timeInput) return alert("Please select a time.");
  if (alarms.includes(timeInput)) return alert("Alarm already set.");

  alarms.push(timeInput);
  renderAlarms();
  alert(`Alarm set for ${timeInput}`);
}

function renderAlarms() {
  const alarmList = document.getElementById("alarmList");
  alarmList.innerHTML = '';
  alarms.forEach((time, index) => {
    const li = document.createElement("li");
    li.textContent = time + " ";
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = () => {
      alarms.splice(index, 1);
      renderAlarms();
    };
    li.appendChild(btn);
    alarmList.appendChild(li);
  });
}

function checkAlarms(now) {
  const time = now.toTimeString().slice(0, 5); // HH:MM
  alarms.forEach((alarmTime, i) => {
    if (alarmTime === time) {
      showAlarmNotification(alarmTime);
      alarms.splice(i, 1);
      renderAlarms();
    }
  });
}

function showAlarmNotification(time) {
  playAlarmSound();
  if (Notification.permission === "granted") {
    const notification = new Notification("⏰ Alarm!", {
      body: `It's ${time}`,
      icon: "alarm-icon.png",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [{ action: "snooze", title: "Snooze 5 min" }]
    });

    notification.onclick = () => {
      notification.close();
      stopAlarmSound();
    };

    notification.addEventListener("action", event => {
      if (event.action === "snooze") {
        notification.close();
        snoozeAlarm(5);
      }
    });
  }
}

function playAlarmSound() {
  const audio = customAlarmSound || alarmSoundElement;
  if (!audio || !audio.src) {
    console.warn("⚠️ No alarm sound selected.");
    return;
  }

  audio.currentTime = 0;
  audio.play().catch(e => console.warn("Sound play error:", e));

  clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(() => {
    stopAlarmSound();
  }, 15000);
}

function stopAlarmSound() {
  const audio = customAlarmSound || alarmSoundElement;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  clearTimeout(alarmTimeout);
  clearTimeout(snoozeTimeout);
}

function snoozeAlarm(minutes) {
  stopAlarmSound();
  console.log(`💤 Alarm snoozed for ${minutes} minutes.`);
  snoozeTimeout = setTimeout(() => {
    playAlarmSound();
  }, minutes * 60 * 1000);
}

// Handle user custom audio input
document.getElementById("customSoundInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    alarmSoundElement.src = url;
    customAlarmSound = alarmSoundElement;
    console.log("🔊 Custom alarm sound loaded.");
  }
});

// Startup logic
window.onload = function () {
  updateClock();
  setInterval(updateClock, 1000);
  viewSavedHistory();
};
