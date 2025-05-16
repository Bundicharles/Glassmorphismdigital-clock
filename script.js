<script>
let alarms = [];
let alarmTimeout = null;
let customAlarmSound = null;
const alarmSoundElement = document.getElementById("alarmSound");

// Load custom alarm sound from user file input
document.getElementById("customSoundInput").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    alarmSoundElement.src = url;
    customAlarmSound = alarmSoundElement;
    console.log("🔊 Custom alarm sound loaded.");
  }
});

// Real-time clock updater
function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[now.getDay()];
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  const fullDate = `${day}/${month}/${year} (${dayName})`;

  document.getElementById("dateDisplay").textContent = fullDate;
}

// Add a new alarm
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

// Render the alarms list
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

// Check alarms every 15s
function checkAlarms() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  alarms.forEach((alarmTime, index) => {
    if (alarmTime === currentTime) {
      showAlarmNotification(alarmTime);
      alarms.splice(index, 1); // Remove triggered alarm
      renderAlarms();
    }
  });
}

// Show notification and play sound
function showAlarmNotification(time) {
  playAlarmSound();

  if (Notification.permission === "granted") {
    new Notification("⏰ Alarm!", {
      body: `It's ${time}`,
      icon: "alarm-icon.png",
      vibrate: [200, 100, 200]
    });
  } else {
    console.warn("Notification permission not granted.");
  }
}

// Play the alarm sound
function playAlarmSound() {
  const audio = customAlarmSound || alarmSoundElement;

  if (!audio || !audio.src) {
    console.warn("⚠️ No alarm sound selected.");
    return;
  }

  audio.currentTime = 0;
  audio.play().catch(err => {
    console.warn("⚠️ Failed to play alarm sound:", err);
  });

  clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
    console.log("🔇 Alarm sound stopped after 15 seconds.");
  }, 15000);
}

// Start everything when page loads
window.onload = function () {
  updateClock();
  setInterval(updateClock, 1000); // Update clock every second
  setInterval(checkAlarms, 15000); // Check alarms every 15 seconds

  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
};
</script>
