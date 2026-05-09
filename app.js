import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const missions = {
  mission1: {
    id: "mission1",
    title: "미션 1",
    type: "puzzle",
  },
  mission2: {
    id: "mission2",
    title: "미션 2",
    type: "blank",
    question: "아무것도 ____하지 마십시오.",
    answer: "걱정",
  },
};

let userId = localStorage.getItem("userId");
if (!userId) {
  userId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
  localStorage.setItem("userId", userId);
}

let progress = {
  mission1: false,
  mission2: false,
};

const app = document.getElementById("app");

async function loadProgress() {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    progress = snap.data().progress || progress;
  } else {
    await setDoc(ref, {
      userId,
      progress,
      createdAt: new Date().toISOString(),
    });
  }
}

async function saveProgress() {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, {
    progress,
    updatedAt: new Date().toISOString(),
  });
}

function completedCount() {
  return Object.values(progress).filter(Boolean).length;
}

function renderHome() {
  app.innerHTML = `
    <div class="page">
      <h1 class="title">청소년대회</h1>
      <p class="subtitle">우리 팀</p>

      <div class="progress-box">
        <p>현재 진행 상황</p>
        <h2>${completedCount()} / ${Object.keys(missions).length}</h2>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${completedCount() / Object.keys(missions).length * 100}%"></div>
        </div>
      </div>

      <p class="guide">QR코드를 찾아 미션을 수행하세요.</p>

      <button class="main-btn" onclick="startQR()">QR 스캔하기</button>
      <button class="sub-btn" onclick="showMap()">지도 보기</button>

      <button class="reset-btn" onclick="resetGame()">처음부터 다시하기</button>
    </div>
  `;
}

window.startQR = function () {
  app.innerHTML = `
    <div class="page">
      <h2>QR 스캔</h2>
      <p>카메라로 QR코드를 스캔하세요.</p>

      <div id="reader" style="width:100%; max-width:350px; margin:20px auto;"></div>

      <button class="reset-btn" onclick="renderHome()">돌아가기</button>
    </div>
  `;

  const html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250,
    },
    async (decodedText) => {
      await html5QrCode.stop();
      handleQR(decodedText);
    },
    () => {}
  ).catch(() => {
    alert("카메라를 사용할 수 없습니다.");
    renderHome();
  });
};

function handleQR(text) {
  let missionId = "";

  if (text.includes("mission1")) missionId = "mission1";
  if (text.includes("mission2")) missionId = "mission2";

  if (!missionId || !missions[missionId]) {
    alert("등록되지 않은 QR입니다.");
    renderHome();
    return;
  }

  if (progress[missionId]) {
    alert("이미 완료한 미션입니다.");
    renderHome();
    return;
  }

  const mission = missions[missionId];

  if (mission.type === "puzzle") {
    renderPuzzleMission(missionId);
  }

  if (mission.type === "blank") {
    renderBlankMission(missionId);
  }
}

function renderPuzzleMission(missionId) {
  app.innerHTML = `
    <div class="page">
      <h2>미션 1</h2>
      <p>퍼즐을 완성하세요.</p>

      <div id="puzzle"></div>

      <button class="reset-btn" onclick="renderHome()">돌아가기</button>
    </div>
  `;

  const puzzle = document.getElementById("puzzle");
  const pieces = [];

  for (let i = 0; i < 9; i++) {
    pieces.push(i);
  }

  pieces.sort(() => Math.random() - 0.5);

  puzzle.style.display = "grid";
  puzzle.style.gridTemplateColumns = "repeat(3, 1fr)";
  puzzle.style.gap = "4px";
  puzzle.style.width = "300px";
  puzzle.style.height = "300px";
  puzzle.style.margin = "20px auto";

  pieces.forEach((num) => {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.draggable = true;
    piece.dataset.index = num;

    piece.style.backgroundImage = "url('./puzzle.png')";
    piece.style.backgroundSize = "300px 300px";
    piece.style.backgroundPosition = `${-(num % 3) * 100}px ${-Math.floor(num / 3) * 100}px`;
    piece.style.border = "1px solid #fff";

    puzzle.appendChild(piece);
  });

  let dragged = null;

  document.querySelectorAll(".piece").forEach((piece) => {
    piece.addEventListener("dragstart", () => {
      dragged = piece;
    });

    piece.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    piece.addEventListener("drop", () => {
      if (!dragged || dragged === piece) return;

      const tempIndex = dragged.dataset.index;
      const tempBg = dragged.style.backgroundPosition;

      dragged.dataset.index = piece.dataset.index;
      dragged.style.backgroundPosition = piece.style.backgroundPosition;

      piece.dataset.index = tempIndex;
      piece.style.backgroundPosition = tempBg;

      checkPuzzleComplete(missionId);
    });
  });
}

async function checkPuzzleComplete(missionId) {
  const pieces = document.querySelectorAll(".piece");
  const complete = Array.from(pieces).every((piece, index) => {
    return Number(piece.dataset.index) === index;
  });

  if (complete) {
    progress[missionId] = true;
    await saveProgress();

    app.innerHTML = `
      <div class="page">
        <h2>미션 완료!</h2>
        <p>퍼즐을 완성했습니다.</p>

        <img src="./puzzle.png" style="width:300px; max-width:90%; border-radius:20px; margin:20px auto; display:block;">

        <button class="main-btn" onclick="renderHome()">확인</button>
      </div>
    `;
  }
}

function renderBlankMission(missionId) {
  const mission = missions[missionId];

  app.innerHTML = `
    <div class="page">
      <h2>미션 2</h2>
      <p>${mission.question}</p>

      <input id="answerInput" placeholder="정답 입력" style="padding:15px; font-size:20px; width:80%; text-align:center; border-radius:12px; border:1px solid #ccc;">

      <button class="main-btn" onclick="checkBlankAnswer('${missionId}')">정답 확인</button>
      <button class="reset-btn" onclick="renderHome()">돌아가기</button>
    </div>
  `;
}

window.checkBlankAnswer = async function (missionId) {
  const input = document.getElementById("answerInput").value.trim();
  const answer = missions[missionId].answer;

  if (input === answer) {
    progress[missionId] = true;
    await saveProgress();

    app.innerHTML = `
      <div class="page">
        <h2>미션 완료!</h2>
        <p>정답입니다.</p>
        <button class="main-btn" onclick="renderHome()">확인</button>
      </div>
    `;
  } else {
    alert("다시 생각해보세요!");
  }
};

window.showMap = function () {
  alert("지도는 여기에 연결하면 됩니다.");
};

window.resetGame = async function () {
  if (!confirm("정말 처음부터 다시 시작할까요?")) return;

  progress = {
    mission1: false,
    mission2: false,
  };

  await saveProgress();
  renderHome();
};

window.renderHome = renderHome;

await loadProgress();
renderHome();