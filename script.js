function viewSavedHistory(filterDate = null) {
  const container = document.getElementById("notesHistory");
  container.innerHTML = '';
  const notes = [];

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('note_') || key.startsWith('future_')) {
      const [type, date, time] = key.split('_');
      const value = JSON.parse(localStorage.getItem(key));

      if (!filterDate || filterDate === date) {
        notes.push({
          type,
          date,
          time,
          content: value.content,
          savedAt: value.savedAt,
          futureDate: value.futureDate,
          key
        });
      }
    }
  });

  notes.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  if (notes.length === 0) {
    container.innerHTML = '<p>No saved notes or events found.</p>';
    return;
  }

  notes.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note-item");
    div.innerHTML = `
      <strong>${note.type === 'future' ? "📅 Future Event" : "📝 Note"}:</strong><br>
      <strong>${note.savedAt}</strong><br>
      <p>${note.content}</p>
      <button onclick="deleteNote('${note.key}')">Delete</button>
      <hr>
    `;
    container.appendChild(div);
  });
}
