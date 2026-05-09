import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 전체 미션 목록
const missions = [
  {
    id: "puzzle",
    title: "1번 미션: 퍼즐 맞추기"
  },
  {
    id: "quiz",
    title: "2번 미션: 퀴즈 미션"
  },
  {
    id: "photo",
    title: "3번 미션: 사진 미션"
  },
  {
    id: "password",
    title: "4번 미션: 암호 미션"
  },
  {
    id: "final",
    title: "5번 미션: 최종 미션"
  }
];

// HTML 요소 가져오기
const loginBox = document.getElementById("loginBox");
const mainBox = document.getElementById("mainBox");

const nameInput = document.getElementById("name");
const baptismNameInput = document.getElementById("baptismName");
const teamInput = document.getElementById("team");

const enterBtn = document.getElementById("enterBtn");
const welcomeText = document.getElementById("welcomeText");
const resetBtn = document.getElementById("resetBtn");

const missionCount = document.getElementById("missionCount");
const stampBoard = document.getElementById("stampBoard");
const mainGuide = document.getElementById("mainGuide");

const puzzleSection = document.getElementById("puzzleSection");
const puzzleBoard = document.getElementById("puzzleBoard");
const puzzleMessage = document.getElementById("puzzleMessage");

let selectedPiece = null;
let currentUser = null;

// 저장된 참가자 정보 확인
const savedUser = localStorage.getItem("missionUser");

if (savedUser) {
  currentUser = JSON.parse(savedUser);
  showMain(currentUser);
}

// 시작하기 버튼 클릭
enterBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const baptismName = baptismNameInput.value.trim();
  const team = teamInput.value.trim();

  if (!name || !baptismName || !team) {
    alert("이름, 세례명, 팀 이름을 모두 입력해주세요.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "participants"), {
      name: name,
      baptismName: baptismName,
      team: team,
      completedMissions: [],
      createdAt: serverTimestamp()
    });

    const user = {
      id: docRef.id,
      name: name,
      baptismName: baptismName,
      team: team,
      completedMissions: []
    };

    currentUser = user;

    localStorage.setItem("missionUser", JSON.stringify(user));

    showMain(user);

  } catch (error) {
    console.error(error);
    alert("저장 중 오류가 발생했습니다.");
  }
});

// 메인 화면 보여주기
function showMain(user) {
  loginBox.style.display = "none";
  mainBox.style.display = "block";

  welcomeText.textContent =
    `${user.team}팀 ${user.name} ${user.baptismName}님 환영합니다!`;

  renderMissionStatus(user);

  const urlParams = new URLSearchParams(window.location.search);
  const mission = urlParams.get("mission");

  if (mission === "puzzle") {
    showPuzzleMission();
  } else {
    hideAllMissions();
    mainGuide.textContent = "QR코드를 찾아 미션을 수행하세요.";
  }
}

// 미션 현황판 표시
function renderMissionStatus(user) {
  const completed = user.completedMissions || [];
  const totalCount = missions.length;
  const completedCount = completed.length;
  const remainingCount = totalCount - completedCount;

  missionCount.textContent =
    `전체 미션 ${totalCount}개 / 완료 ${completedCount}개 / 남은 미션 ${remainingCount}개`;

  stampBoard.innerHTML = "";

  missions.forEach((mission) => {
    const item = document.createElement("div");
    item.classList.add("stamp-item");

    if (completed.includes(mission.id)) {
      item.classList.add("done");
      item.textContent = `✅ 완료 - ${mission.title}`;
    } else {
      item.textContent = `⬜ 미완료 - ${mission.title}`;
    }

    stampBoard.appendChild(item);
  });
}

// 모든 미션 숨기기
function hideAllMissions() {
  puzzleSection.style.display = "none";
}

// 퍼즐 미션 보여주기
function showPuzzleMission() {
  mainGuide.textContent = "1번 미션 장소에 도착했습니다!";
  puzzleSection.style.display = "block";

  if (currentUser.completedMissions.includes("puzzle")) {
    puzzleBoard.style.display = "none";
    puzzleMessage.textContent = "✅ 이미 완료한 미션입니다!";
    return;
  }

  puzzleBoard.style.display = "grid";
  puzzleMessage.textContent = "";
  createPuzzle();
}

// 퍼즐 만들기
function createPuzzle() {
  puzzleBoard.innerHTML = "";
  puzzleMessage.textContent = "";
  selectedPiece = null;

  let pieces = [];

  for (let i = 0; i < 9; i++) {
    pieces.push(i);
  }

  pieces = shuffleArray(pieces);

  pieces.forEach((pieceNumber) => {
    const piece = document.createElement("div");

    piece.classList.add("puzzle-piece");

    piece.dataset.correct = pieceNumber;

    const row = Math.floor(pieceNumber / 3);
    const col = pieceNumber % 3;

    piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;

    piece.addEventListener("click", () => {
      selectPiece(piece);
    });

    puzzleBoard.appendChild(piece);
  });
}

// 퍼즐 조각 선택
function selectPiece(piece) {
  if (!selectedPiece) {
    selectedPiece = piece;
    piece.style.outline = "4px solid red";
    return;
  }

  if (selectedPiece === piece) {
    selectedPiece.style.outline = "none";
    selectedPiece = null;
    return;
  }

  swapPieces(selectedPiece, piece);

  selectedPiece.style.outline = "none";
  selectedPiece = null;

  checkPuzzleComplete();
}

// 퍼즐 조각 교환
function swapPieces(piece1, piece2) {
  const tempBackground = piece1.style.backgroundPosition;
  const tempCorrect = piece1.dataset.correct;

  piece1.style.backgroundPosition = piece2.style.backgroundPosition;
  piece1.dataset.correct = piece2.dataset.correct;

  piece2.style.backgroundPosition = tempBackground;
  piece2.dataset.correct = tempCorrect;
}

// 퍼즐 완성 확인
function checkPuzzleComplete() {
  const pieces = document.querySelectorAll(".puzzle-piece");

  let complete = true;

  pieces.forEach((piece, index) => {
    if (Number(piece.dataset.correct) !== index) {
      complete = false;
    }
  });

  if (complete) {
    completeMission("puzzle");
  }
}

// 미션 완료 처리
async function completeMission(missionId) {
  if (currentUser.completedMissions.includes(missionId)) {
    return;
  }

  currentUser.completedMissions.push(missionId);

  localStorage.setItem("missionUser", JSON.stringify(currentUser));

  renderMissionStatus(currentUser);

  puzzleMessage.textContent = "🎉 퍼즐 성공! 1번 미션 완료 도장을 받았습니다!";
  puzzleBoard.style.display = "none";

  try {
    const userRef = doc(db, "participants", currentUser.id);

    await updateDoc(userRef, {
      completedMissions: arrayUnion(missionId)
    });

  } catch (error) {
    console.error(error);
    alert("미션 완료 저장 중 오류가 발생했습니다.");
  }
}

// 배열 섞기
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 초기화 버튼
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("missionUser");

  const cleanUrl = window.location.origin + window.location.pathname;
  window.location.href = cleanUrl;
});