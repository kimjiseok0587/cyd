// app.js 전체 교체용

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
    answer: "걱정",
    question: "아무것도 ____하지 마십시오.",
    qrValues: ["2", "mission2", "MISSION_2"],
  },
];

let completedMissions = JSON.parse(localStorage.getItem("completedMissions") || "[]");
let currentMission = null;

const app = document.getElementById("app");

function saveProgress() {
  localStorage.setItem("completedMissions", JSON.stringify(completedMissions));
}

function isCompleted(id) {
  return completedMissions.includes(id);
}

function completeMission(id) {
  if (!completedMissions.includes(id)) {
    completedMissions.push(id);
    saveProgress();
  }
  showCompleteScreen(id);
}

function resetProgress() {
  if (confirm("정말 처음부터 다시 시작할까요?")) {
    completedMissions = [];
    localStorage.removeItem("completedMissions");
    renderHome();
  }
}

function renderHome() {
  app.innerHTML = `
    <div class="container">
      <h1>청소년 대회 미션 여권</h1>
      <p class="subtitle">QR을 스캔해서 미션을 수행하세요.</p>

      <div class="progress-box">
        <div class="progress-text">
          완료한 미션 ${completedMissions.length} / ${missions.length}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${(completedMissions.length / missions.length) * 100}%"></div>
        </div>
      </div>

      <button class="main-btn" onclick="startQRScan()">QR 스캔하기</button>
      <button class="sub-btn" onclick="alert('지도 이미지는 나중에 연결하면 됩니다.')">지도 보기</button>

      <div class="stamp-list">
        ${missions
          .map(
            (m) => `
            <div class="stamp ${isCompleted(m.id) ? "done" : ""}">
              <div>${m.title}</div>
              <strong>${isCompleted(m.id) ? "완료" : "미완료"}</strong>
            </div>
          `
          )
          .join("")}
      </div>

      <button class="reset-btn" onclick="resetProgress()">처음부터 다시하기</button>
    </div>
  `;
}

function normalizeQR(qrText) {
  let value = qrText.trim();

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

  return missions.find((mission) => {
    return mission.id === value || mission.qrValues.includes(value);
  });
}

function handleQRCode(qrText) {
  console.log("스캔된 QR:", qrText);

  const mission = findMissionByQR(qrText);

  if (!mission) {
    alert("등록되지 않은 QR코드입니다.");
    renderHome();
    return;
  }

  openMission(mission.id);
}

function startQRScan() {
  app.innerHTML = `
    <div class="container">
      <h1>QR 스캔</h1>
      <p class="subtitle">카메라에 QR코드를 비춰주세요.</p>
      <div id="reader"></div>
      <button class="reset-btn" onclick="stopQRScanAndHome()">돌아가기</button>
    </div>
  `;

  const html5QrCode = new Html5Qrcode("reader");

  window.currentQrScanner = html5QrCode;

  html5QrCode
    .start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250,
      },
      async (decodedText) => {
        await html5QrCode.stop();
        window.currentQrScanner = null;
        handleQRCode(decodedText);
      },
      () => {}
    )
    .catch((err) => {
      console.error(err);
      alert("카메라를 실행할 수 없습니다.");
      renderHome();
    });
}

async function stopQRScanAndHome() {
  if (window.currentQrScanner) {
    try {
      await window.currentQrScanner.stop();
    } catch (e) {}
    window.currentQrScanner = null;
  }
  renderHome();
}

function openMission(id) {
  const mission = missions.find((m) => m.id === id);

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
  } else if (mission.type === "blank") {
    renderBlankMission(mission);
  }
}

function renderBlankMission(mission) {
  app.innerHTML = `
    <div class="container">
      <h1>${mission.title}</h1>
      <h2>${mission.name}</h2>

      <div class="mission-box">
        <p class="question">${mission.question}</p>
        <input id="blankAnswer" class="answer-input" placeholder="정답 입력" />
        <button class="main-btn" onclick="checkBlankAnswer()">정답 확인</button>
      </div>

      <button class="reset-btn" onclick="renderHome()">홈으로</button>
    </div>
  `;
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
      <h1>${mission.title}</h1>
      <h2>${mission.name}</h2>
      <p class="subtitle">사진 조각을 눌러서 순서대로 맞춰보세요.</p>

      <div id="puzzle" class="puzzle"></div>

      <button class="sub-btn" onclick="shufflePuzzle()">다시 섞기</button>
      <button class="reset-btn" onclick="renderHome()">홈으로</button>
    </div>
  `;

  createPuzzle();
}

let puzzleOrder = [];

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
  const puzzle = document.getElementById("puzzle");
  puzzle.innerHTML = "";

  puzzleOrder.forEach((num, index) => {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.style.backgroundImage = "url('puzzle.png')";

    const x = num % 3;
    const y = Math.floor(num / 3);

    piece.style.backgroundPosition = `${x * 50}% ${y * 50}%`;

    piece.onclick = () => {
      movePiece(index);
    };

    puzzle.appendChild(piece);
  });
}

function movePiece(index) {
  if (index > 0) {
    [puzzleOrder[index - 1], puzzleOrder[index]] = [puzzleOrder[index], puzzleOrder[index - 1]];
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
      <h1>퍼즐 완성!</h1>
      <p class="subtitle">완성된 사진을 확인하세요.</p>

      <img src="puzzle.png" class="complete-image" />

      <button class="main-btn" onclick="completeMission('1')">미션 완료하기</button>
    </div>
  `;
}

function showCompleteScreen(id) {
  const mission = missions.find((m) => m.id === id);

  app.innerHTML = `
    <div class="container">
      <h1>미션 완료!</h1>
      <div class="complete-stamp">완료 도장</div>
      <p class="subtitle">${mission.title} - ${mission.name}</p>

      <button class="main-btn" onclick="renderHome()">홈으로 돌아가기</button>
    </div>
  `;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

renderHome();