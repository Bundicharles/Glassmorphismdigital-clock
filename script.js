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

  checkReminders(now);
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
  const savedAt = now.toISOString();
  const key = `note_${Date.now()}`;
  const note = {
    content,
    savedAt
  };

  localStorage.setItem(key, JSON.stringify(note));
  document.getElementById("savedStatus").textContent = "📝 Note saved!";
  document.getElementById("diaryInput").value = "";
  viewSavedHistory();
}

function saveFutureEvent() {
  const content = document.getElementById("diaryInput").value.trim();
  if (!content) return;

  const reminder = prompt("Enter date and time for reminder (YYYY-MM-DDTHH:MM):"); // ISO format
  if (!reminder || isNaN(Date.parse(reminder))) {
    alert("Invalid date format. Use YYYY-MM-DDTHH:MM");
    return;
  }

  const key = `future_${Date.now()}`;
  const event = {
    content,
    reminder
  };

  localStorage.setItem(key, JSON.stringify(event));
  document.getElementById("savedStatus").textContent = "📅 Future event saved!";
  document.getElementById("diaryInput").value = "";
  viewSavedHistory();
}

function viewSavedHistory(filterDate = null) {
  const container = document.getElementById("notesHistory");
  container.innerHTML = '';
  const entries = [];

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("note_") || key.startsWith("future_")) {
      const data = JSON.parse(localStorage.getItem(key));
      const isFuture = key.startsWith("future_");
      const date = isFuture ? data.reminder : data.savedAt;

      if (!filterDate || (date && date.startsWith(filterDate))) {
        entries.push({
          type: isFuture ? "Future Event" : "Note",
          content: data.content,
          time: date,
          key
        });
      }
    }
  });

  entries.sort((a, b) => new Date(a.time) - new Date(b.time));

  if (entries.length === 0) {
    container.innerHTML = "<p>No saved notes or events found.</p>";
    return;
  }

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("note-item");
    div.innerHTML = `
      <strong>${entry.type}:</strong><br>
      <em>${entry.time}</em><br>
      <p>${entry.content}</p>
      <button onclick="deleteNote('${entry.key}')">Delete</button>
      <hr>
    `;
    container.appendChild(div);
  });
}

function deleteNote(key) {
  if (confirm("Delete this entry?")) {
    localStorage.removeItem(key);
    viewSavedHistory(document.getElementById("dateFilter")?.value || null);
  }
}

function checkReminders(now) {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("future_")) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data.reminder && !data.notified) {
        const reminderTime = new Date(data.reminder);
        const nowTrimmed = new Date(now.toISOString().slice(0, 16)); // Minute precision
        if (reminderTime.getTime() === nowTrimmed.getTime()) {
          showNotification("⏰ Reminder", data.content);
          data.notified = true;
          localStorage.setItem(key, JSON.stringify(data)); // Avoid re-notifying
        }
      }
    }
  });
}

function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}

window.onload = function () {
  updateClock();
  setInterval(updateClock, 1000);
  viewSavedHistory();
};
