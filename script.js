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
  
  function saveNote() {
    const note = document.getElementById("diaryInput").value.trim();
    if (note) {
      const currentDate = new Date();
      const date = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const time = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS
      const key = `note_${date}_${time}`;
      localStorage.setItem(key, note);
      document.getElementById("savedStatus").textContent = "Note saved!";
      document.getElementById("diaryInput").value = ""; // Clear input after saving
    }
  }
  
  function saveFutureEvent() {
    const event = document.getElementById("diaryInput").value.trim();
    const futureDate = prompt("Enter date for this event (YYYY-MM-DD):");
  
    if (event && futureDate) {
      const key = `future_${futureDate}_${Date.now()}`; // allow multiple events per date
      localStorage.setItem(key, event);
      document.getElementById("savedStatus").textContent = "Future event saved!";
      document.getElementById("diaryInput").value = "";
    }
  }
  
  function viewSavedHistory(filterDate = null) {
    const notesHistoryContainer = document.getElementById("notesHistory");
    notesHistoryContainer.innerHTML = '';
  
    const notes = [];
  
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('note_') || key.startsWith('future_')) {
        const parts = key.split('_');
        const type = parts[0]; // note or future
        const date = parts[1];
        const time = parts[2] || "";
  
        if (!filterDate || filterDate === date) {
          notes.push({
            type,
            date,
            time,
            content: localStorage.getItem(key),
            key
          });
        }
      }
    });
  
    notes.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  
    if (notes.length > 0) {
      notes.forEach(note => {
        const noteElement = document.createElement("div");
        noteElement.classList.add("note-item");
        noteElement.innerHTML = `
          <strong>${note.type === 'future' ? "Future Event" : "Note"}:</strong>
          <br>
          <strong>${note.date} ${note.time}</strong><br>
          <p>${note.content}</p>
          <button onclick="deleteNote('${note.key}')">Delete</button>
          <hr>
        `;
        notesHistoryContainer.appendChild(noteElement);
      });
    } else {
      notesHistoryContainer.innerHTML = '<p>No saved notes or events found.</p>';
    }
  }
  
  function deleteNote(key) {
    if (confirm("Delete this entry?")) {
      localStorage.removeItem(key);
      viewSavedHistory(document.getElementById("dateFilter")?.value || null);
    }
  }
  
  window.onload = function () {
    updateClock();
    setInterval(updateClock, 1000);
    viewSavedHistory();
  };
  