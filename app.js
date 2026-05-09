const TOTAL_MISSIONS = 20;

const loginBox = document.getElementById("loginBox");
const mainBox = document.getElementById("mainBox");

const nameInput = document.getElementById("name");
const baptismNameInput = document.getElementById("baptismName");
const teamInput = document.getElementById("team");

const enterBtn = document.getElementById("enterBtn");
const welcomeText = document.getElementById("welcomeText");
const missionCount = document.getElementById("missionCount");
const progressFill = document.getElementById("progressFill");

const scanBtn = document.getElementById("scanBtn");
const mapBtn = document.getElementById("mapBtn");
const resetBtn = document.getElementById("resetBtn");

const reader = document.getElementById("reader");
const mapSection = document.getElementById("mapSection");
const puzzleSection = document.getElementById("puzzleSection");

let html5QrCode = null;

let userInfo = JSON.parse(localStorage.getItem("userInfo")) || null;
let completedMissions = JSON.parse(localStorage.getItem("completedMissions")) || [];

function saveUserInfo(info) {
  localStorage.setItem("userInfo", JSON.stringify(info));
}

function saveProgress() {
  localStorage.setItem("completedMissions", JSON.stringify(completedMissions));
}

function showLoginScreen() {
  loginBox.style.display = "flex";
  mainBox.style.display = "none";
}

function showMainScreen() {
  loginBox.style.display = "none";
  mainBox.style.display = "flex";

  if (userInfo) {
    welcomeText.textContent = `${userInfo.team}팀 ${userInfo.name} ${userInfo.baptismName}님`;
  }

  hideAllSections();
  updateProgress();
}

function hideAllSections() {
  reader.style.display = "none";
  mapSection.style.display = "none";
  puzzleSection.style.display = "none";
}

function updateProgress() {
  const completedCount = completedMissions.length;
  const percent = Math.round((completedCount / TOTAL_MISSIONS) * 100);

  missionCount.textContent = `${completedCount} / ${TOTAL_MISSIONS}`;
  progressFill.style.width = `${percent}%`;
}

enterBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const baptismName = baptismNameInput.value.trim();
  const team = teamInput.value.trim();

  if (!name || !baptismName || !team) {
    alert("이름, 세례명, 팀 이름을 모두 입력해주세요.");
    return;
  }

  userInfo = {
    name,
    baptismName,
    team
  };

  saveUserInfo(userInfo);
  showMainScreen();
});

scanBtn.addEventListener("click", () => {
  hideAllSections();
  reader.style.display = "block";
  startQRScanner();
});

mapBtn.addEventListener("click", () => {
  stopScanner();

  if (mapSection.style.display === "block") {
    mapSection.style.display = "none";
  } else {
    hideAllSections();
    mapSection.style.display = "block";
  }
});

resetBtn.addEventListener("click", () => {
  const ok = confirm("정말 처음부터 다시 시작할까요? 이름과 진행 상황이 모두 삭제됩니다.");

  if (!ok) return;

  stopScanner();

  localStorage.removeItem("userInfo");
  localStorage.removeItem("completedMissions");

  userInfo = null;
  completedMissions = [];

  nameInput.value = "";
  baptismNameInput.value = "";
  teamInput.value = "";

  showLoginScreen();
});

function startQRScanner() {
  stopScanner();

  html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250
      }
    },
    (decodedText) => {
      stopScanner();
      handleQRCode(decodedText);
    },
    () => {}
  ).catch(() => {
    alert("카메라 권한을 허용해야 QR 스캔을 사용할 수 있습니다.");
    hideAllSections();
  });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {});
    html5QrCode = null;
  }
}

function handleQRCode(decodedText) {
  const qrText = decodedText.trim();

  if (!qrText.startsWith("gamgok_mission_")) {
    alert("등록되지 않은 QR코드입니다.");
    hideAllSections();
    return;
  }

  const missionNumberText = qrText.replace("gamgok_mission_", "");
  const missionNumber = Number(missionNumberText);

  if (!missionNumber || missionNumber < 1 || missionNumber > TOTAL_MISSIONS) {
    alert("등록되지 않은 미션 QR코드입니다.");
    hideAllSections();
    return;
  }

  openMission(missionNumber);
}

function openMission(num) {
  hideAllSections();

  if (num === 1) {
    showMission1();
    return;
  }

  showMissionPlaceholder(num);
}

function showMission1() {
  puzzleSection.style.display = "block";

  puzzleSection.innerHTML = `
    <h2>1번 미션: 퍼즐 맞추기</h2>
    <p>사진 조각을 눌러 서로 바꾸며 퍼즐을 완성하세요.</p>

    <div id="puzzleBoard"></div>

    <p id="puzzleMessage"></p>

    <button class="main-button qr-button" id="completeMission1Btn">
      미션 완료하기
    </button>
  `;

  document.getElementById("completeMission1Btn").addEventListener("click", () => {
    completeMission(1);
  });
}

function showMissionPlaceholder(num) {
  puzzleSection.style.display = "block";

  puzzleSection.innerHTML = `
    <h2>${num}번 미션</h2>
    <p>이곳에 ${num}번 미션 내용이 들어갑니다.</p>

    <button class="main-button qr-button" id="completeMissionBtn">
      미션 완료하기
    </button>
  `;

  document.getElementById("completeMissionBtn").addEventListener("click", () => {
    completeMission(num);
  });
}

function completeMission(num) {
  const missionId = `gamgok_mission_${String(num).padStart(2, "0")}`;

  if (!completedMissions.includes(missionId)) {
    completedMissions.push(missionId);
    saveProgress();
    alert(`${num}번 미션 완료!`);
  } else {
    alert(`${num}번 미션은 이미 완료했습니다.`);
  }

  hideAllSections();
  updateProgress();
}

if (userInfo) {
  showMainScreen();
} else {
  showLoginScreen();
}