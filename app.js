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

let puzzleOrder = [];
let selectedPiece = null;

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

  userInfo = { name, baptismName, team };
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
    showPuzzleMission();
    return;
  }

  showMissionPlaceholder(num);
}

function showPuzzleMission() {
  puzzleSection.style.display = "block";

  puzzleSection.innerHTML = `
    <h2>1번 미션: 퍼즐 맞추기</h2>
    <p>사진 조각을 눌러 서로 바꾸며 퍼즐을 완성하세요.</p>

    <div id="puzzleBoard"></div>

    <p id="puzzleMessage"></p>

    <button class="main-button map-button" id="shufflePuzzleBtn">
      다시 섞기
    </button>
  `;

  createPuzzle();

  document.getElementById("shufflePuzzleBtn").addEventListener("click", () => {
    createPuzzle();
  });
}

function createPuzzle() {
  const puzzleBoard = document.getElementById("puzzleBoard");
  const puzzleMessage = document.getElementById("puzzleMessage");

  puzzleOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  selectedPiece = null;

  do {
    puzzleOrder = shuffleArray([...puzzleOrder]);
  } while (isPuzzleSolved());

  puzzleBoard.innerHTML = "";
  puzzleMessage.textContent = "";

  puzzleBoard.style.display = "grid";
  puzzleBoard.style.gridTemplateColumns = "repeat(3, 1fr)";
  puzzleBoard.style.gap = "4px";
  puzzleBoard.style.width = "300px";
  puzzleBoard.style.height = "300px";
  puzzleBoard.style.margin = "18px auto";
  puzzleBoard.style.border = "3px solid #8b5e34";
  puzzleBoard.style.background = "#8b5e34";

  renderPuzzlePieces();
}

function renderPuzzlePieces() {
  const puzzleBoard = document.getElementById("puzzleBoard");

  puzzleBoard.innerHTML = "";

  puzzleOrder.forEach((pieceNumber, currentIndex) => {
    const piece = document.createElement("div");

    const row = Math.floor(pieceNumber / 3);
    const col = pieceNumber % 3;

    piece.style.width = "100%";
    piece.style.height = "100%";
    piece.style.backgroundImage = "url('puzzle.png')";
    piece.style.backgroundSize = "300px 300px";
    piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
    piece.style.cursor = "pointer";
    piece.style.border = "1px solid #fff8e8";

    if (selectedPiece === currentIndex) {
      piece.style.outline = "4px solid #ffcc00";
    }

    piece.addEventListener("click", () => {
      handlePieceClick(currentIndex);
    });

    puzzleBoard.appendChild(piece);
  });
}

function handlePieceClick(index) {
  if (selectedPiece === null) {
    selectedPiece = index;
    renderPuzzlePieces();
    return;
  }

  if (selectedPiece === index) {
    selectedPiece = null;
    renderPuzzlePieces();
    return;
  }

  const temp = puzzleOrder[selectedPiece];
  puzzleOrder[selectedPiece] = puzzleOrder[index];
  puzzleOrder[index] = temp;

  selectedPiece = null;
  renderPuzzlePieces();

  if (isPuzzleSolved()) {
    showPuzzleCompleteScreen();
  }
}

function showPuzzleCompleteScreen() {
  const puzzleBoard = document.getElementById("puzzleBoard");
  const puzzleMessage = document.getElementById("puzzleMessage");
  const shufflePuzzleBtn = document.getElementById("shufflePuzzleBtn");

  if (shufflePuzzleBtn) {
    shufflePuzzleBtn.style.display = "none";
  }

  puzzleBoard.style.display = "block";
  puzzleBoard.style.width = "300px";
  puzzleBoard.style.height = "auto";
  puzzleBoard.style.margin = "18px auto";
  puzzleBoard.style.border = "none";
  puzzleBoard.style.background = "transparent";

  puzzleBoard.innerHTML = `
    <img 
      src="puzzle.png"
      alt="완성된 퍼즐"
      style="
        width:100%;
        border-radius:18px;
        border:4px solid #8b5e34;
        box-shadow:0 8px 18px rgba(60, 38, 15, 0.25);
      "
    />
  `;

  puzzleMessage.innerHTML = `
    <div style="
      margin-top:18px;
      font-size:24px;
      font-weight:900;
      color:#8b5e34;
    ">
      퍼즐 완성!
    </div>

    <p style="
      margin-top:8px;
      color:#5a3d21;
      line-height:1.6;
    ">
      완성된 사진을 확인했습니다.<br>
      아래 버튼을 누르면 미션이 완료됩니다.
    </p>

    <button
      id="finishPuzzleMissionBtn"
      class="main-button qr-button"
      style="margin-top:18px;"
    >
      미션 완료하기
    </button>
  `;

  document.getElementById("finishPuzzleMissionBtn").addEventListener("click", () => {
    finishPuzzleMission();
  });
}

function finishPuzzleMission() {
  const missionId = "gamgok_mission_01";

  if (!completedMissions.includes(missionId)) {
    completedMissions.push(missionId);
    saveProgress();
  }

  updateProgress();

  const puzzleMessage = document.getElementById("puzzleMessage");

  puzzleMessage.innerHTML = `
    <div style="
      margin-top:18px;
      font-size:24px;
      font-weight:900;
      color:#8b5e34;
    ">
      1번 미션 완료!
    </div>

    <p style="
      margin-top:8px;
      color:#5a3d21;
      line-height:1.6;
    ">
      완성된 사진을 확인했습니다.<br>
      다음 장소로 이동하세요.
    </p>

    <button
      class="main-button back-button"
      id="backHomeAfterPuzzleBtn"
    >
      메인으로 돌아가기
    </button>
  `;

  document.getElementById("backHomeAfterPuzzleBtn").addEventListener("click", () => {
    showMainScreen();
  });
}

function isPuzzleSolved() {
  return puzzleOrder.every((pieceNumber, index) => pieceNumber === index);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = array[i];

    array[i] = array[randomIndex];
    array[randomIndex] = temp;
  }

  return array;
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