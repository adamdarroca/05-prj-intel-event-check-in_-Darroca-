const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const attendancePercent = document.getElementById("attendancePercent");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");

const STORAGE_KEY = "intelEventCheckIns";

//Track attendance
let count = 0;
const maxCount = 50;

let checkIns = [];

const teamSubmissions = {
  water: [],
  zero: [],
  power: [],
};

function updateAttendanceUI() {
  attendeeCount.textContent = count;

  const percentageNumber = Math.min(100, Math.round((count / maxCount) * 100));
  const percentage = `${percentageNumber}%`;

  progressBar.style.width = percentage;
  attendancePercent.textContent = percentage;
}

function showGreetingMessage(message) {
  greeting.textContent = message;
  greeting.classList.add("success-message");
  greeting.style.display = "block";
}

function addNameToTeamList(team, name) {
  if (!teamSubmissions[team]) {
    teamSubmissions[team] = [];
  }

  teamSubmissions[team].push(name);

  const teamNamesList = document.getElementById(team + "Names");
  if (!teamNamesList) {
    return;
  }

  const listItem = document.createElement("li");
  listItem.textContent = name;
  teamNamesList.appendChild(listItem);
}

function saveCheckIns() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
}

function isValidTeam(team) {
  return team === "water" || team === "zero" || team === "power";
}

function loadCheckIns() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    checkIns = [];
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      checkIns = [];
      return;
    }

    const cleaned = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!item) {
        continue;
      }

      const savedName = String(item.name || "").trim();
      const savedTeam = String(item.team || "").trim();

      if (savedName === "" || !isValidTeam(savedTeam)) {
        continue;
      }

      cleaned.push({ name: savedName, team: savedTeam });
    }

    checkIns = cleaned;
  } catch (error) {
    checkIns = [];
  }
}

function clearTeamListsUI() {
  const teams = ["water", "zero", "power"];

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];

    const teamCounter = document.getElementById(team + "Count");
    if (teamCounter) {
      teamCounter.textContent = "0";
    }

    const teamNamesList = document.getElementById(team + "Names");
    if (teamNamesList) {
      teamNamesList.innerHTML = "";
    }
  }
}

function rebuildUIFromSavedData() {
  teamSubmissions.water = [];
  teamSubmissions.zero = [];
  teamSubmissions.power = [];

  clearTeamListsUI();

  let validCount = 0;

  for (let i = 0; i < checkIns.length; i++) {
    if (validCount >= maxCount) {
      break;
    }

    const checkIn = checkIns[i];
    const team = checkIn.team;
    const name = checkIn.name;

    if (!isValidTeam(team) || name === "") {
      continue;
    }

    validCount++;
    addNameToTeamList(team, name);

    const teamCounter = document.getElementById(team + "Count");
    if (teamCounter) {
      teamCounter.textContent = parseInt(teamCounter.textContent) + 1;
    }
  }

  count = validCount;
  updateAttendanceUI();
}

//Handle Form Submission
form.addEventListener("submit", function (event){
  event.preventDefault();
  //Get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;
  console.log(name, teamName);

  if (name === "" || team === "") {
    return;
  }

  //Increment count and check if max is reached
  if (count >= maxCount) {
    showGreetingMessage("Sorry, check-in is full (50/50). ");
    return;
  }

  count++;
  console.log("Total check-ins: " + count);

  updateAttendanceUI();

  //Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  //Keep a list of names under each team
  addNameToTeamList(team, name);

  //Save to localStorage
  checkIns.push({ name: name, team: team });
  saveCheckIns();
  
  //Show welcome message
  const message = `🎉 Welcome, ${name} from ${teamName}!`;
  showGreetingMessage(message);

  form.reset();
});

// Load saved data and set initial UI state on page load
loadCheckIns();
rebuildUIFromSavedData();