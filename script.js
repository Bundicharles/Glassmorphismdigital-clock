let alarms = [];
let alarmTimeout = null;
let snoozeTimeout = null;
let customAlarmSound = null;
const alarmSoundElement = document.getElementById("alarmSound");

// ---------- Clock and Date ----------
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

  checkFutureEvents(now);
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

// ---------- Diary / Future Events ----------

/**
 * Saves either a current note or a future event depending on user input.
 * Future events require a date and time; notes do not.
 */
function saveEntry() {
  const content = document.getElementById("diaryInput").value.trim();
  if (!content) {
    alert("Please enter some text.");
    return;
  }

  // Ask user if this is a future event or a current note
  const isFuture = confirm("Save as a future event? (OK for yes, Cancel for no)");

  if (isFuture) {
    // For future event, get date and time
    let eventDate = prompt("Enter event date (YYYY-MM-DD):");
    if (!eventDate || !isValidDate(eventDate)) {
      alert("Invalid or missing date.");
      return;
    }

    let eventTime = prompt("Enter event time (HH:MM, 24-hour):");
    if (!eventTime || !isValidTime(eventTime)) {
      alert("Invalid or missing time.");
      return;
    }

    // Save future event
    const key = `future_${Date.now()}`;
    const event = {
      content,
      eventDate,  // in YYYY-MM-DD
      eventTime,  // in HH:MM
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(event));
    alert(`Future event saved for ${eventDate} at ${eventTime}.`);
  } else {
    // Save current note with today's date
    const now = new Date();
    const key = `note_${Date.now()}`;
    const note = {
      content,
      savedAt: now.toISOString().slice(0, 10)  // YYYY-MM-DD
    };
    localStorage.setItem(key, JSON.stringify(note));
    alert("Note saved for today.");
  }

  document.getElementById("diaryInput").value = "";
  viewSavedHistory();
}

// Helper: Validate date in YYYY-MM-DD
function isValidDate(dateString) {
  const reg = /^\d{4}-\d{2}-\d{2}$/;
  if (!reg.test(dateString)) return false;
  const d = new Date(dateString);
  return d instanceof Date && !isNaN(d);
}

// Helper: Validate time in HH:MM 24h
function isValidTime(timeString) {
  const reg = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return reg.test(timeString);
}

// View saved entries for selected date (notes + future events)
function viewSavedHistory() {
  const dateFilter = document.getElementById("dateFilter").value; // YYYY-MM-DD or empty
  const container = document.getElementById("notesHistory");
  container.innerHTML = "";

  if (!dateFilter) {
    container.innerHTML = "<p>Please select a date to view saved notes and events.</p>";
    return;
  }

  let found = false;

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("note_") || key.startsWith("future_")) {
      const entry = JSON.parse(localStorage.getItem(key));
      
      // For notes, savedAt is date; for future events, eventDate is the event date
      const entryDate = key.startsWith("note_") ? entry.savedAt : entry.eventDate;

      if (entryDate === dateFilter) {
        found = true;
        const div = document.createElement("div");
        div.classList.add("note-item");

        if (key.startsWith("note_")) {
          div.innerHTML = `
            <strong>📝 Note</strong><br>
            <p>${entry.content}</p>
            <small>Saved At: ${entry.savedAt}</small><br>
            <button onclick="deleteEntry('${key}')">Delete</button>
            <hr>
          `;
        } else {
          div.innerHTML = `
            <strong>📅 Future Event</strong><br>
            <p>${entry.content}</p>
            <small>Event Date: ${entry.eventDate} ${entry.eventTime}</small><br>
            <button onclick="deleteEntry('${key}')">Delete</button>
            <hr>
          `;
        }

        container.appendChild(div);
      }
    }
  });

  if (!found) {
    container.innerHTML = "<p>No notes or future events found for this date.</p>";
  }
}

// Delete a note or event by key
function deleteEntry(key) {
  if (confirm("Delete this entry?")) {
    localStorage.removeItem(key);
    viewSavedHistory();
  }
}

// ---------- Alarm Logic (including snooze) ----------

function addAlarm() {
  const timeInput = document.getElementById("alarmTime").value;
  if (!timeInput) {
    alert("Please select a time for the alarm.");
    return;
  }
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
  alarmList.innerHTML = "";
  alarms.forEach((time, i) => {
    const li = document.createElement("li");
    li.textContent = time + " ";
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = () => {
      alarms.splice(i, 1);
      renderAlarms();
    };
    li.appendChild(btn);
    alarmList.appendChild(li);
  });
}

function checkAlarms(now) {
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  alarms.forEach((alarmTime, i) => {
    if (alarmTime === currentTime) {
      showAlarmNotification(alarmTime);
      alarms.splice(i, 1);
      renderAlarms();
    }
  });
}

// ---------- Future Events Notification & Alarm ----------

function checkFutureEvents(now) {
  const currentDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("future_")) {
      const event = JSON.parse(localStorage.getItem(key));
      if (event.eventDate === currentDate && event.eventTime === currentTime) {
        // Trigger notification and alarm sound
        showFutureEventNotification(event);
      }
    }
  });
}

function showFutureEventNotification(event) {
  playAlarmSound();
  if (Notification.permission === "granted") {
    const notification = new Notification("📅 Event Reminder", {
      body: event.content + `\nAt ${event.eventTime}`,
      icon: "alarm-icon.png",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [{ action: "snooze", title: "Snooze 5 min" }]
    });

    notification.onclick = () => {
      notification.close();
      stopAlarmSound();
    };

    notification.addEventListener("action", e => {
      if (e.action === "snooze") {
        notification.close();
        snoozeAlarm(5);
      }
    });
  }
}

// ---------- Alarm Sound & Snooze ----------

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
  }, 15000); // 15 seconds
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

// ---------- Custom Alarm Sound Input ----------

document.getElementById("customSoundInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    alarmSoundElement.src = url;
    customAlarmSound = alarmSoundElement;
    console.log("🔊 Custom alarm sound loaded.");
  }
});

// ---------- Initialization ----------

window.onload = function () {
  updateClock();
  setInterval(updateClock, 1000);
  viewSavedHistory();
};
