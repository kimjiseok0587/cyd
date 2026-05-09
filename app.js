import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const missions = [
  {
    id: "1",
    title: "미션 1",
    name: "퍼즐 맞추기",
    type: "puzzle",
    qrValues: ["1", "mission1", "MISSION_1"],
  },
  {
    id: "2",
    title: "미션 2",
    name: "빈칸 채우기",
    type: "blank",
    question: "아무것도 ____하지 마십시오.",
    answer: "걱정",
    qrValues: ["2", "mission2", "MISSION_2"],
  },
];

const app = document.getElementById("app");

let participant = JSON.parse(localStorage.getItem("participant") || "null");
let completedMissions = JSON.parse(localStorage.getItem("completedMissions") || "[]");
let currentMission = null;
let currentQrScanner = null;
let puzzleOrder = [];

function saveParticipant(name, baptism, team) {
  participant = {
    name,
    baptism,
    team,
    startedAt: new Date().toISOString(),
  };

  localStorage.setItem("participant", JSON.stringify(participant));
}

function saveProgress() {
  localStorage.setItem("completedMissions", JSON.stringify(completedMissions));
}

function isCompleted(id) {
  return completedMissions.includes(id);
}

async function saveToFirebase(missionId) {
  if (!participant) return;

  try {
    await addDoc(collection(db, "participants"), {
      name: participant.name,
      baptism: participant.baptism,
      team: participant.team,
      missionId,
      completedAt: serverTimestamp(),
    });

    console.log("Firebase 저장 완료");
  } catch (error) {
    console.error("Firebase 저장 오류:", error);
    alert("미션은 완료됐지만 데이터 저장 중 오류가 발생했습니다.");
  }
}

function renderStart() {
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1 class="title">스탬프 투어</h1>
        <p class="subtitle">이름과 세례명을 입력하세요.</p>

        <input type="text" id="nameInput" placeholder="이름" />
        <input type="text" id="baptismInput" placeholder="세례명" />
        <input type="text" id="teamInput" placeholder="팀 이름" />

        <button id="startBtn" class="main-button qr-button">시작하기</button>
      </div>
    </div>
  `;

  document.getElementById("startBtn").addEventListener("click", startGame);
}

function startGame() {
  const name = document.getElementById("nameInput").value.trim();
  const baptism = document.getElementById("baptismInput").value.trim();
  const team = document.getElementById("teamInput").value.trim();

  if (!name) {
    alert("이름을 입력해주세요.");
    return;
  }

  if (!baptism) {
    alert("세례명을 입력해주세요.");
    return;
  }

  if (!team) {
    alert("팀 이름을 입력해주세요.");
    return;
  }

  saveParticipant(name, baptism, team);
  renderHome();
}

function renderHome() {
  if (!participant) {
    renderStart();
    return;
  }

  const percent = (completedMissions.length / missions.length) * 100;

  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1 class="title">스탬프 투어</h1>
        <h2>${participant.name} ${participant.baptism}</h2>
        <p class="subtitle">${participant.team} 팀</p>

        <div class="progress-box">
          <div class="progress-label">현재 진행 상황</div>
          <div class="progress-number">${completedMissions.length} / ${missions.length}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${percent}%"></div>
          </div>
        </div>

        <p>QR코드를 찾아 미션을 수행하세요.</p>

        <button id="scanBtn" class="main-button qr-button">QR 스캔하기</button>
        <button id="mapBtn" class="main-button map-button">지도 보기</button>

        <div class="stamp-list">
          ${missions.map(m => `
            <div class="stamp ${isCompleted(m.id) ? "done" : ""}">
              <div>${m.title}</div>
              <strong>${isCompleted(m.id) ? "완료" : "미완료"}</strong>
            </div>
          `).join("")}
        </div>

        <button id="resetBtn" class="main-button back-button">처음부터 다시하기</button>
      </div>
    </div>
  `;

  document.getElementById("scanBtn").addEventListener("click", startQRScan);
  document.getElementById("mapBtn").addEventListener("click", renderMap);
  document.getElementById("resetBtn").addEventListener("click", resetProgress);
}

function renderMap() {
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1 class="title">지도</h1>
        <img src="map.png" class="map-img" />
        <button id="homeBtn" class="main-button back-button">홈으로</button>
      </div>
    </div>
  `;

  document.getElementById("homeBtn").addEventListener("click", renderHome);
}

function resetProgress() {
  if (confirm("정말 처음부터 다시 시작할까요?")) {
    participant = null;
    completedMissions = [];
    localStorage.removeItem("participant");
    localStorage.removeItem("completedMissions");
    renderStart();
  }
}

function normalizeQR(qrText) {
  const value = qrText.trim();

  try {
    const url = new URL(value);
    const missionParam = url.searchParams.get("mission");
    if (missionParam) return missionParam.trim();

    const idParam = url.searchParams.get("id");
    if (idParam) return idParam.trim();
  } catch (e) {}

  if (value.includes("mission=1")) return "1";
  if (value.includes("mission=2")) return "2";

  return value;
}

function findMissionByQR(qrText) {
  const value = normalizeQR(qrText);

  return missions.find(mission => {
    return mission.id === value || mission.qrValues.includes(value);
  });
}

function startQRScan() {
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1 class="title">QR 스캔</h1>
        <p class="subtitle">카메라에 QR코드를 비춰주세요.</p>
        <div id="reader"></div>
        <button id="cancelScanBtn" class="main-button back-button">돌아가기</button>
      </div>
    </div>
  `;

  document.getElementById("cancelScanBtn").addEventListener("click", stopQRScanAndHome);

  currentQrScanner = new Html5Qrcode("reader");

  currentQrScanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250,
    },
    async (decodedText) => {
      await currentQrScanner.stop();
      currentQrScanner = null;
      handleQRCode(decodedText);
    },
    () => {}
  ).catch((error) => {
    console.error(error);
    alert("카메라를 실행할 수 없습니다.");
    renderHome();
  });
}

async function stopQRScanAndHome() {
  if (currentQrScanner) {
    try {
      await currentQrScanner.stop();
    } catch (e) {}
    currentQrScanner = null;
  }

  renderHome();
}

function handleQRCode(qrText) {
  console.log("스캔된 QR:", qrText);

  const mission = findMissionByQR(qrText);

  if (!mission) {
    alert("등록되지 않은 QR코드입니다.\n스캔된 내용: " + qrText);
    renderHome();
    return;
  }

  openMission(mission.id);
}

function openMission(id) {
  const mission = missions.find(m => m.id === id);

  if (!mission) {
    alert("등록되지 않은 미션입니다.");
    renderHome();
    return;
  }

  currentMission = mission;

  if (isCompleted(id)) {
    showCompleteScreen(id);
    return;
  }

  if (mission.type === "puzzle") {
    renderPuzzleMission(mission);
  }

  if (mission.type === "blank") {
    renderBlankMission(mission);
  }
}

function renderBlankMission(mission) {
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1 class="title">${mission.title}</h1>
        <h2>${mission.name}</h2>

        <div class="mission-box">
          <p class="question">${mission.question}</p>
          <input id="blankAnswer" placeholder="정답 입력" />
          <button id="checkAnswerBtn" class="main-button qr-button">정답 확인</button>
        </div>

        <button id="homeBtn" class="main-button back-button">홈으로</button>
      </div>
    </div>
  `;

  document.getElementById("checkAnswerBtn").addEventListener("click", checkBlankAnswer);
  document.getElementById("homeBtn").addEventListener("click", renderHome);
}

function checkBlankAnswer() {
  const input = document.getElementById("blankAnswer").value.trim();

  if (input === currentMission.answer) {
    completeMission(currentMission.id);
  } else {
    alert("다시 생각해보세요!");
  }
}

function renderPuzzleMission(mission) {
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1 class="title">${mission.title}</h1>
        <h2>${mission.name}</h2>
        <p>사진 조각을 눌러 순서를 바꿔 퍼즐을 완성하세요.</p>

        <div id="puzzleBoard" class="puzzle"></div>
        <p id="puzzleMessage"></p>

        <button id="shuffleBtn" class="main-button map-button">다시 섞기</button>
        <button id="homeBtn" class="main-button back-button">홈으로</button>
      </div>
    </div>
  `;

  document.getElementById("shuffleBtn").addEventListener("click", shufflePuzzle);
  document.getElementById("homeBtn").addEventListener("click", renderHome);

  createPuzzle();
}

function createPuzzle() {
  puzzleOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  shuffleArray(puzzleOrder);
  drawPuzzle();
}

function shufflePuzzle() {
  shuffleArray(puzzleOrder);
  drawPuzzle();
}

function drawPuzzle() {
  const board = document.getElementById("puzzleBoard");
  board.innerHTML = "";

  puzzleOrder.forEach((num, index) => {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.style.backgroundImage = "url('puzzle.png')";

    const x = num % 3;
    const y = Math.floor(num / 3);

    piece.style.backgroundPosition = `${x * 50}% ${y * 50}%`;

    piece.addEventListener("click", () => {
      movePiece(index);
    });

    board.appendChild(piece);
  });
}

function movePiece(index) {
  if (index > 0) {
    const temp = puzzleOrder[index - 1];
    puzzleOrder[index - 1] = puzzleOrder[index];
    puzzleOrder[index] = temp;
  }

  drawPuzzle();
  checkPuzzleComplete();
}

function checkPuzzleComplete() {
  const correct = puzzleOrder.every((num, index) => num === index);

  if (correct) {
    setTimeout(() => {
      showPuzzleFinished();
    }, 300);
  }
}

function showPuzzleFinished() {
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1 class="title">퍼즐 완성!</h1>
        <p class="subtitle">완성된 사진입니다.</p>

        <img src="puzzle.png" class="complete-image" />

        <button id="completePuzzleBtn" class="main-button qr-button">미션 완료하기</button>
      </div>
    </div>
  `;

  document.getElementById("completePuzzleBtn").addEventListener("click", () => {
    completeMission("1");
  });
}

async function completeMission(id) {
  if (!completedMissions.includes(id)) {
    completedMissions.push(id);
    saveProgress();
    await saveToFirebase(id);
  }

  showCompleteScreen(id);
}

function showCompleteScreen(id) {
  const mission = missions.find(m => m.id === id);

  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h1 class="title">미션 완료!</h1>
        <div class="complete-stamp">완료 도장</div>
        <p class="subtitle">${mission.title} - ${mission.name}</p>

        <button id="homeBtn" class="main-button qr-button">홈으로 돌아가기</button>
      </div>
    </div>
  `;

  document.getElementById("homeBtn").addEventListener("click", renderHome);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

if (participant) {
  renderHome();
} else {
  renderStart();
}