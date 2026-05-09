import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = document.getElementById("app");

const TOTAL_MISSIONS = 2;

const QR_CODES = {
  mission1: "MISSION_1_PUZZLE",
  mission2: "MISSION_2_QUIZ"
};

let currentUser = null;
let completedMissions = [];

// 참가자 구분용 ID
function makePlayerId(name, baptism) {
  return `${name.trim()}_${baptism.trim()}`;
}

// 로그인 정보 저장
function saveLoginInfo(name, baptism) {
  localStorage.setItem("playerName", name);
  localStorage.setItem("playerBaptism", baptism);
  localStorage.setItem("playerId", makePlayerId(name, baptism));
}

// 로그인 정보 불러오기
function loadLoginInfo() {
  const name = localStorage.getItem("playerName");
  const baptism = localStorage.getItem("playerBaptism");
  const playerId = localStorage.getItem("playerId");

  if (!name || !baptism || !playerId) return null;

  return { name, baptism, playerId };
}

// 진행률 불러오기
async function loadProgress() {
  const ref = doc(db, "participants", currentUser.playerId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    completedMissions = snap.data().completedMissions || [];
  } else {
    completedMissions = [];

    await setDoc(ref, {
      name: currentUser.name,
      baptism: currentUser.baptism,
      playerId: currentUser.playerId,
      completedMissions: [],
      createdAt: new Date().toISOString()
    });
  }
}

// 진행률 저장
async function saveProgress() {
  const ref = doc(db, "participants", currentUser.playerId);

  await updateDoc(ref, {
    completedMissions,
    updatedAt: new Date().toISOString()
  });
}

// --------------------
// 로그인 화면
// --------------------
function showLogin() {
  app.innerHTML = `
    <div class="screen login-screen">
      <h1>청소년대회<br>스탬프 투어</h1>

      <input id="nameInput" type="text" placeholder="이름" />
      <input id="baptismInput" type="text" placeholder="세례명" />

      <button id="loginBtn">입장하기</button>
    </div>
  `;

  document.getElementById("loginBtn").addEventListener("click", async () => {
    const name = document.getElementById("nameInput").value.trim();
    const baptism = document.getElementById("baptismInput").value.trim();

    if (!name || !baptism) {
      alert("이름과 세례명을 모두 입력해주세요.");
      return;
    }

    saveLoginInfo(name, baptism);

    currentUser = {
      name,
      baptism,
      playerId: makePlayerId(name, baptism)
    };

    await loadProgress();
    showMain();
  });
}

// --------------------
// 메인 화면
// 기존 양식 유지
// --------------------
function showMain() {
  const percent = Math.round((completedMissions.length / TOTAL_MISSIONS) * 100);

  app.innerHTML = `
    <div class="screen main-screen">
      <h1>청소년대회<br>스탬프 투어</h1>

      <div class="user-box">
        <p>${currentUser.name} ${currentUser.baptism}</p>
      </div>

      <div class="progress-box">
        <p>나의 진행률</p>
        <h2>${percent}%</h2>
        <p>${completedMissions.length} / ${TOTAL_MISSIONS}</p>
      </div>

      <button id="scanBtn">QR 코드 찍기</button>
      <button id="mapBtn">지도 보기</button>
      <button id="homeBtn">처음으로</button>

      <div id="qr-reader" style="display:none;"></div>
    </div>
  `;

  document.getElementById("scanBtn").addEventListener("click", startQrScanner);

  document.getElementById("mapBtn").addEventListener("click", () => {
    alert("지도는 나중에 연결하면 됩니다.");
  });

  document.getElementById("homeBtn").addEventListener("click", () => {
    localStorage.removeItem("playerName");
    localStorage.removeItem("playerBaptism");
    localStorage.removeItem("playerId");

    currentUser = null;
    completedMissions = [];

    showLogin();
  });
}

// --------------------
// QR 스캔
// --------------------
function startQrScanner() {
  const qrBox = document.getElementById("qr-reader");
  qrBox.style.display = "block";
  qrBox.innerHTML = "";

  const html5QrCode = new Html5Qrcode("qr-reader");

  Html5Qrcode.getCameras()
    .then((cameras) => {
      if (!cameras || cameras.length === 0) {
        alert("카메라를 찾을 수 없습니다.");
        return;
      }

      const camera =
        cameras.find((cam) =>
          cam.label.toLowerCase().includes("back")
        ) || cameras[cameras.length - 1];

      html5QrCode.start(
        camera.id,
        {
          fps: 10,
          qrbox: 250
        },
        async (decodedText) => {
          await html5QrCode.stop();
          qrBox.style.display = "none";
          handleQr(decodedText);
        },
        () => {}
      );
    })
    .catch(() => {
      alert("카메라 실행 중 오류가 발생했습니다.");
    });
}

function handleQr(text) {
  if (text === QR_CODES.mission1) {
    showMission1();
    return;
  }

  if (text === QR_CODES.mission2) {
    showMission2();
    return;
  }

  alert("등록되지 않은 QR 코드입니다.");
}

// --------------------
// 미션 완료 체크
// --------------------
function isCompleted(missionId) {
  return completedMissions.includes(missionId);
}

async function completeMission(missionId) {
  if (!completedMissions.includes(missionId)) {
    completedMissions.push(missionId);
    await saveProgress();
  }

  showCompleteScreen(missionId);
}

// --------------------
// 미션1 퍼즐
// --------------------
function showMission1() {
  if (isCompleted("mission1")) {
    alert("이미 완료한 미션입니다.");
    showMain();
    return;
  }

  app.innerHTML = `
    <div class="screen mission-screen">
      <h2>미션 1</h2>
      <p>퍼즐을 완성하세요.</p>

      <div id="puzzleBoard" class="puzzle-board"></div>

      <button id="backBtn">메인으로</button>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", showMain);

  createPuzzle();
}

function createPuzzle() {
  const board = document.getElementById("puzzleBoard");

  const pieces = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const shuffled = [...pieces].sort(() => Math.random() - 0.5);

  let selected = null;

  shuffled.forEach((num) => {
    const piece = document.createElement("div");
    piece.className = "puzzle-piece";
    piece.dataset.number = num;
    piece.style.backgroundImage = "url('./puzzle.png')";
    piece.style.backgroundSize = "300% 300%";

    const row = Math.floor((num - 1) / 3);
    const col = (num - 1) % 3;

    piece.style.backgroundPosition = `${col * 50}% ${row * 50}%`;

    piece.addEventListener("click", () => {
      if (!selected) {
        selected = piece;
        piece.classList.add("selected");
      } else {
        const tempNumber = selected.dataset.number;
        const tempPosition = selected.style.backgroundPosition;

        selected.dataset.number = piece.dataset.number;
        selected.style.backgroundPosition = piece.style.backgroundPosition;

        piece.dataset.number = tempNumber;
        piece.style.backgroundPosition = tempPosition;

        selected.classList.remove("selected");
        selected = null;

        checkPuzzleComplete();
      }
    });

    board.appendChild(piece);
  });
}

async function checkPuzzleComplete() {
  const pieces = document.querySelectorAll(".puzzle-piece");

  const complete = [...pieces].every((piece, index) => {
    return Number(piece.dataset.number) === index + 1;
  });

  if (complete) {
    setTimeout(() => {
      app.innerHTML = `
        <div class="screen mission-screen">
          <h2>퍼즐 완성!</h2>
          <img src="./puzzle.png" style="width:100%; max-width:350px; border-radius:16px;" />
          <button id="completeBtn">완료 도장 받기</button>
        </div>
      `;

      document.getElementById("completeBtn").addEventListener("click", async () => {
        await completeMission("mission1");
      });
    }, 500);
  }
}

// --------------------
// 미션2 빈칸 채우기
// --------------------
function showMission2() {
  if (isCompleted("mission2")) {
    alert("이미 완료한 미션입니다.");
    showMain();
    return;
  }

  app.innerHTML = `
    <div class="screen mission-screen">
      <h2>미션 2</h2>
      <p>"아무것도 ____하지 마십시오."</p>

      <input id="answerInput" type="text" placeholder="정답 입력" />

      <button id="submitAnswerBtn">정답 확인</button>
      <button id="backBtn">메인으로</button>
    </div>
  `;

  document.getElementById("submitAnswerBtn").addEventListener("click", async () => {
    const answer = document.getElementById("answerInput").value.trim();

    if (answer === "걱정") {
      await completeMission("mission2");
    } else {
      alert("다시 생각해보세요.");
    }
  });

  document.getElementById("backBtn").addEventListener("click", showMain);
}

// --------------------
// 완료 화면
// --------------------
function showCompleteScreen(missionId) {
  app.innerHTML = `
    <div class="screen complete-screen">
      <h1>도장 완료!</h1>
      <p>${missionId} 완료</p>

      <button id="mainBtn">메인으로 돌아가기</button>
    </div>
  `;

  document.getElementById("mainBtn").addEventListener("click", showMain);
}

// --------------------
// 앱 시작
// --------------------
async function startApp() {
  const savedUser = loadLoginInfo();

  if (savedUser) {
    currentUser = savedUser;
    await loadProgress();
    showMain();
  } else {
    showLogin();
  }
}

startApp();