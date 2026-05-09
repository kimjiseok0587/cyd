import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// HTML 요소 가져오기
const loginBox = document.getElementById("loginBox");
const mainBox = document.getElementById("mainBox");

const nameInput = document.getElementById("name");
const baptismNameInput = document.getElementById("baptismName");
const teamInput = document.getElementById("team");

const enterBtn = document.getElementById("enterBtn");
const welcomeText = document.getElementById("welcomeText");
const resetBtn = document.getElementById("resetBtn");

const puzzleBoard = document.getElementById("puzzleBoard");
const puzzleMessage = document.getElementById("puzzleMessage");

let selectedPiece = null;

// 저장된 참가자 정보 확인
const savedUser = localStorage.getItem("missionUser");

if (savedUser) {
  const user = JSON.parse(savedUser);
  showMain(user);
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

  const user = {
    name: name,
    baptismName: baptismName,
    team: team
  };

  try {
    await addDoc(collection(db, "participants"), {
      name: name,
      baptismName: baptismName,
      team: team,
      createdAt: serverTimestamp()
    });

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

  createPuzzle();
}

// 초기화 버튼
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("missionUser");
  location.reload();
});

// 퍼즐 만들기
function createPuzzle() {
  puzzleBoard.innerHTML = "";
  puzzleMessage.textContent = "";

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
    puzzleMessage.textContent = "퍼즐 성공! 1번 미션 완료!";
  }
}

// 배열 섞기
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}