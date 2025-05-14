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

// Save Regular Note
function saveNote() {
  const text = document.getElementById("diaryInput").value.trim();
  if (!text) return;

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];

  const key = `note_${date}_${time}`;
  const value = {
    content: text,
    type: "note",
    savedAt: `${date} ${time}`
  };

  localStorage.setItem(key, JSON.stringify(value));
  document.getElementById("savedStatus").textContent = "Note saved!";
  document.getElementById("diaryInput").value = "";
  viewSavedHistory();
}

// Save Future Event with Reminder
function saveFutureEvent() {
  const text = document.getElementById("diaryInput").value.trim();
  if (!text) return;

  const reminderDate = prompt("Enter reminder date and time (YYYY-MM-DDTHH:MM):");
  if (!reminderDate || isNaN(new Date(reminderDate))) {
    alert("Invalid date format.");
    return;
  }

  const key = `future_${reminderDate}_${Date.now()}`;
  const value = {
    content: text,
    type: "future",
    reminder: reminderDate
  };

  localStorage.setItem(key, JSON.stringify(value));
  document.getElementById("savedStatus").textContent = "Future event saved!";
  document.getElementById("diaryInput").value = "";
  scheduleReminder(reminderDate, text);
  viewSavedHistory();
}

// View Notes and Events
function viewSavedHistory(filterDate = null) {
  const container = document.getElementById("notesHistory");
  container.innerHTML = '';
  const entries = [];

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('note_') || key.startsWith('future_')) {
      const value = JSON.parse(localStorage.getItem(key));
      const date = key.split('_')[1];

      if (!filterDate || filterDate === date || (value.reminder && value.reminder.startsWith(filterDate))) {
        entries.push({
          key,
          ...value
        });
      }
    }
  });

  entries.sort((a, b) => {
    const dateA = new Date(a.savedAt || a.reminder);
    const dateB = new Date(b.savedAt || b.reminder);
    return dateA - dateB;
  });

  if (entries.length === 0) {
    container.innerHTML = '<p>No saved notes or events found.</p>';
    return;
  }

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("note-item");
    div.innerHTML = `
      <strong>${entry.type === "future" ? "📅 Future Event" : "📝 Note"}:</strong><br>
      <strong>${entry.savedAt || entry.reminder}</strong><br>
      <p>${entry.content}</p>
      <button onclick="deleteNote('${entry.key}')">Delete</button>
      <hr>
    `;
    container.appendChild(div);
  });
}

// Delete Entry
function deleteNote(key) {
  if (confirm("Delete this entry?")) {
    localStorage.removeItem(key);
    viewSavedHistory(document.getElementById("dateFilter")?.value || null);
  }
}

// Notification Scheduler
function scheduleReminder(reminderTime, message) {
  const now = new Date();
  const reminderDate = new Date(reminderTime);
  const delay = reminderDate.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("⏰ Reminder", {
          body: message,
          icon: "icon-192.png"
        });
      }
    }, delay);
  }
}

// Setup: load clock, saved items, and schedule pending future reminders
window.onload = function () {
  updateClock();
  setInterval(updateClock, 1000);
  viewSavedHistory();

  // Check for pending future reminders
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('future_')) {
      const value = JSON.parse(localStorage.getItem(key));
      if (value && value.reminder) {
        scheduleReminder(value.reminder, value.content);
      }
    }
  });

  // Ask permission for notifications
  if ('Notification' in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};
