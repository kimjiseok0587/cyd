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
const puzzleMessage = document.getElementById("puzzleMessage");

let html5QrCode = null;

let userInfo = JSON.parse(localStorage.getItem("userInfo")) || null;
let completedMissions = JSON.parse(localStorage.getItem("completedMissions")) || [];

function saveUserInfo(info) {
  localStorage.setItem("userInfo", JSON.stringify(info));
}

function saveProgress() {
  localStorage.setItem("completedMissions", JSON.stringify(completedMissions));
}

function updateProgress() {
  const completedCount = completedMissions.length;
  const percent = Math.round((completedCount / TOTAL_MISSIONS) * 100);

  missionCount.textContent = `${completedCount} / ${TOTAL_MISSIONS}`;
  progressFill.style.width = `${percent}%`;
}

function showMainScreen() {
  loginBox.style.display = "none";
  mainBox.style.display = "flex";

  if (userInfo) {
    welcomeText.textContent = `${userInfo.name} ${userInfo.baptismName}님, 환영합니다`;
  }

  hideAllSections();
  updateProgress();
}

function showLoginScreen() {
  loginBox.style.display = "flex";
  mainBox.style.display = "none";
}

function hideAllSections() {
  reader.style.display = "none";
  mapSection.style.display = "none";
  puzzleSection.style.display = "none";
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
  hideAllSections();

  if (mapSection.style.display === "block") {
    mapSection.style.display = "none";
  } else {
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
  if (html5QrCode) {
    stopScanner();
  }

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
  hideAllSections();

  if (decodedText.includes("mission1")) {
    showMission1();
    return;
  }

  if (decodedText.includes("mission2")) {
    completeMission(2);
    return;
  }

  if (decodedText.includes("mission3")) {
    completeMission(3);
    return;
  }

  alert("등록되지 않은 QR코드입니다.");
}

function showMission1() {
  puzzleSection.style.display = "block";
  puzzleMessage.textContent = "";

  puzzleSection.innerHTML = `
    <h2>1번 미션: 퍼즐 맞추기</h2>
    <p>이곳에 기존 9조각 퍼즐 게임을 연결할 예정입니다.</p>

    <button class="main-button qr-button" id="completeMission1Btn">
      미션 완료하기
    </button>
  `;

  document.getElementById("completeMission1Btn").addEventListener("click", () => {
    completeMission(1);
  });
}

function completeMission(num) {
  const missionId = `mission${num}`;

  if (!completedMissions.includes(missionId)) {
    completedMissions.push(missionId);
    saveProgress();
  }

  updateProgress();

  alert(`${num}번 미션 완료!`);

  hideAllSections();
}

if (userInfo) {
  showMainScreen();
} else {
  showLoginScreen();
}