function viewSavedHistory(filterDate = null) {
  const container = document.getElementById("notesHistory");
  container.innerHTML = '';
  const notes = [];

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('note_') || key.startsWith('future_')) {
      const value = JSON.parse(localStorage.getItem(key));
      const isFuture = key.startsWith('future_');
      const displayDate = isFuture ? value.reminder : value.savedAt;

      if (!filterDate || (displayDate && displayDate.startsWith(filterDate))) {
        notes.push({
          type: isFuture ? 'future' : 'note',
          content: value.content,
          displayDate,
          key
        });
      }
    }
  });

  notes.sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate));

  if (notes.length === 0) {
    container.innerHTML = '<p>No saved notes or events found.</p>';
    return;
  }

  notes.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note-item");
    div.innerHTML = `
      <strong>${note.type === 'future' ? "📅 Future Event" : "📝 Note"}:</strong><br>
      <strong>${note.displayDate}</strong><br>
      <p>${note.content}</p>
      <button onclick="deleteNote('${note.key}')">Delete</button>
      <hr>
    `;
    container.appendChild(div);
  });
}
