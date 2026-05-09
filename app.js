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
}

// 초기화 버튼
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("missionUser");
  location.reload();
});