import { db } from "./firebase.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = document.getElementById("app");

const TOTAL_MISSIONS = 20;
const USER_ID_KEY = "missionUserId";
const COMPLETE_KEY = "completedMissions";

let currentUserId = localStorage.getItem(USER_ID_KEY);
if (!currentUserId) {
  currentUserId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
  localStorage.setItem(USER_ID_KEY, currentUserId);
}

let completedMissions = JSON.parse(localStorage.getItem(COMPLETE_KEY)) || [];

const missions = [
  {
    id: 1,
    title: "미션 1",
    name: "퍼즐 맞추기",
    type: "puzzle",
    image: "puzzle.png"
  },
  {
    id: 2,
    title: "미션 2",
    name: "빈칸 채우기",
    type: "blank",
    questionBefore: "아무것도",
    questionAfter: "하지 마십시오.",
    answer: "걱정"
  }
];

async function saveProgress() {
  localStorage.setItem(COMPLETE_KEY, JSON.stringify(completedMissions));

  try {
    await setDoc(doc(db, "missionUsers", currentUserId), {
      userId: currentUserId,
      completedMissions,
      updatedAt: new Date()
    });
  } catch (error) {
    console.log("Firebase 저장 오류:", error);
  }
}

async function loadProgress() {
  try {
    const snap = await getDoc(doc(db, "missionUsers", currentUserId));
    if (snap.exists()) {
      completedMissions = snap.data().completedMissions || [];
      localStorage.setItem(COMPLETE_KEY, JSON.stringify(completedMissions));
    }
  } catch (error) {
    console.log("Firebase 불러오기 오류:", error);
  }
}

function completeMission(id) {
  if (!completedMissions.includes(id)) {
    completedMissions.push(id);
    saveProgress();
  }
}

function isCompleted(id) {
  return completedMissions.includes(id);
}

function getMissionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const missionId = Number(params.get("mission"));
  return missions.find(m => m.id === missionId);
}

function showHome() {
  const completedCount = completedMissions.length;

  app.innerHTML = `
    <div class="home-wrap">
      <h1>청소년 대회 미션 여권</h1>
      <p class="subtitle">QR을 찍고 미션을 완료해보세요!</p>

      <div class="progress-card">
        <div class="progress-text">
          <strong>${completedCount}</strong> / ${TOTAL_MISSIONS} 완료
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${(completedCount / TOTAL_MISSIONS) * 100}%"></div>
        </div>
      </div>

      <div class="mission-list">
        ${Array.from({ length: TOTAL_MISSIONS }, (_, i) => {
          const id = i + 1;
          const done = isCompleted(id);
          const mission = missions.find(m => m.id === id);

          return `
            <div class="mission-card ${done ? "done" : ""}">
              <div>
                <strong>미션 ${id}</strong>
                <p>${mission ? mission.name : "준비 중"}</p>
              </div>
              <div class="stamp">${done ? "완료" : "미완료"}</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function showMission(mission) {
  if (!mission) {
    showHome();
    return;
  }

  if (mission.type === "puzzle") {
    showPuzzleMission(mission);
  }

  if (mission.type === "blank") {
    showBlankMission(mission);
  }
}

function showBlankMission(mission) {
  if (isCompleted(mission.id)) {
    showCompleteScreen(mission);
    return;
  }

  app.innerHTML = `
    <div class="mission-wrap">
      <h1>${mission.title}</h1>
      <h2>${mission.name}</h2>

      <div class="blank-card">
        <p class="blank-question">
          ${mission.questionBefore}
          <input id="blankInput" type="text" placeholder="??" autocomplete="off" />
          ${mission.questionAfter}
        </p>

        <button id="checkAnswerBtn">정답 확인</button>
        <p id="resultText"></p>
      </div>

      <button class="home-btn" id="goHomeBtn">메인으로</button>
    </div>
  `;

  const input = document.getElementById("blankInput");
  const resultText = document.getElementById("resultText");

  document.getElementById("checkAnswerBtn").addEventListener("click", () => {
    const userAnswer = input.value.trim().replace(/\s/g, "");

    if (userAnswer === mission.answer) {
      completeMission(mission.id);
      showCompleteScreen(mission);
    } else {
      resultText.textContent = "아직 아니에요. 다시 생각해보세요!";
      resultText.style.color = "#d33";
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      document.getElementById("checkAnswerBtn").click();
    }
  });

  document.getElementById("goHomeBtn").addEventListener("click", showHome);
}

function showPuzzleMission(mission) {
  if (isCompleted(mission.id)) {
    showCompleteScreen(mission);
    return;
  }

  app.innerHTML = `
    <div class="mission-wrap">
      <h1>${mission.title}</h1>
      <h2>${mission.name}</h2>
      <p>흩어진 조각을 맞춰 그림을 완성하세요.</p>

      <div id="puzzleBoard" class="puzzle-board"></div>

      <button id="shuffleBtn">다시 섞기</button>
      <button class="home-btn" id="goHomeBtn">메인으로</button>
    </div>
  `;

  const board = document.getElementById("puzzleBoard");
  let pieces = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let selectedIndex = null;

  function shufflePieces() {
    pieces = pieces.sort(() => Math.random() - 0.5);

    if (pieces.every((v, i) => v === i)) {
      shufflePieces();
      return;
    }

    renderPuzzle();
  }

  function renderPuzzle() {
    board.innerHTML = "";

    pieces.forEach((piece, index) => {
      const tile = document.createElement("div");
      tile.className = "puzzle-piece";
      tile.style.backgroundImage = `url('${mission.image}')`;

      const x = piece % 3;
      const y = Math.floor(piece / 3);

      tile.style.backgroundSize = "300% 300%";
      tile.style.backgroundPosition = `${x * 50}% ${y * 50}%`;

      if (selectedIndex === index) {
        tile.classList.add("selected");
      }

      tile.addEventListener("click", () => {
        if (selectedIndex === null) {
          selectedIndex = index;
        } else {
          const temp = pieces[selectedIndex];
          pieces[selectedIndex] = pieces[index];
          pieces[index] = temp;
          selectedIndex = null;

          if (isPuzzleSolved()) {
            completeMission(mission.id);
            showPuzzleCompleteImage(mission);
            return;
          }
        }

        renderPuzzle();
      });

      board.appendChild(tile);
    });
  }

  function isPuzzleSolved() {
    return pieces.every((piece, index) => piece === index);
  }

  document.getElementById("shuffleBtn").addEventListener("click", shufflePieces);
  document.getElementById("goHomeBtn").addEventListener("click", showHome);

  shufflePieces();
}

function showPuzzleCompleteImage(mission) {
  app.innerHTML = `
    <div class="mission-wrap">
      <h1>퍼즐 완성!</h1>
      <p>그림을 완성했습니다.</p>

      <img src="${mission.image}" class="complete-image" />

      <div class="complete-stamp">미션 완료</div>

      <button class="home-btn" id="goHomeBtn">메인으로</button>
    </div>
  `;

  document.getElementById("goHomeBtn").addEventListener("click", showHome);
}

function showCompleteScreen(mission) {
  app.innerHTML = `
    <div class="mission-wrap">
      <h1>${mission.title}</h1>
      <h2>${mission.name}</h2>

      <div class="complete-stamp">미션 완료</div>

      <p>축하합니다! 이 미션을 완료했습니다.</p>

      <button class="home-btn" id="goHomeBtn">메인으로</button>
    </div>
  `;

  document.getElementById("goHomeBtn").addEventListener("click", showHome);
}

await loadProgress();

const missionFromUrl = getMissionFromUrl();

if (missionFromUrl) {
  showMission(missionFromUrl);
} else {
  showHome();
}