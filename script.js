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
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM only

  alarms.forEach((alarmTime, index) => {
    if (alarmTime === currentTime) {
      showAlarmNotification(alarmTime);
      alarms.splice(index, 1); // Remove triggered alarm
      renderAlarms();
    }
  });
}

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

// Set interval to check alarms every 15 seconds
setInterval(checkAlarms, 15000);

// Request notification permission on page load
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission();
}
