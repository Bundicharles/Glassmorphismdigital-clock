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
  const savedAt = formatDate(now);  // Day/Month/Year format
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
  const eventContent = document.getElementById("diaryInput").value.trim();
  const futureDate = prompt("Enter date for this event (DD/MM/YYYY):");
  const reminderTime = prompt("Enter reminder time (HH:MM):");

  if (eventContent && futureDate && reminderTime) {
    const key = `future_${Date.now()}`; // Unique key for each event
    const futureEvent = {
      content: eventContent,
      futureDate,
      reminderTime,
      savedAt: formatDate(new Date()) // Save when the event is added
    };

    localStorage.setItem(key, JSON.stringify(futureEvent));
    document.getElementById("savedStatus").textContent = "📅 Future event saved!";
    document.getElementById("diaryInput").value = "";
    viewSavedHistory();
  }
}

function viewSavedHistory(filterDate = null) {
  const notesHistoryContainer = document.getElementById("notesHistory");
  notesHistoryContainer.innerHTML = '';
  
  const notes = [];

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('note_') || key.startsWith('future_')) {
      const value = JSON.parse(localStorage.getItem(key));
      const [type, time] = key.split('_');
      const date = formatDate(new Date(value.savedAt));
      
      if (!filterDate || filterDate === date) {
        notes.push({
          type,
          date,
          time,
          content: value.content,
          savedAt: value.savedAt,
          futureDate: value.futureDate,
          reminderTime: value.reminderTime,
          key
        });
      }
    }
  });

  notes.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));

  if (notes.length === 0) {
    notesHistoryContainer.innerHTML = '<p>No saved notes or events found.</p>';
    return;
  }

  notes.forEach(note => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note-item");
    noteElement.innerHTML = `
      <strong>${note.type === 'future' ? "📅 Future Event" : "📝 Note"}:</strong><br>
      <strong>${note.savedAt}</strong><br>
      <p>${note.content}</p>
      ${note.type === 'future' ? `<strong>Reminder at: ${note.reminderTime}</strong><br>` : ""}
      <button onclick="deleteNote('${note.key}')">Delete</button>
      <hr>
    `;
    notesHistoryContainer.appendChild(noteElement);
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

window.onload = function () {
  updateClock();
  setInterval(updateClock, 1000);
  viewSavedHistory();
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(reg => {
      console.log('Service worker registered.', reg);
    }).catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}
