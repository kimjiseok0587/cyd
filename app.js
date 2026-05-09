import { db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = document.getElementById("app");

let qrScanner = null;
let currentUser = JSON.parse(localStorage.getItem("gamgokUser")) || null;

const MISSIONS = {
  mission01: {
    title: "미션 1",
    qr: "gamgok_mission_01",
    type: "puzzle"
  },
  mission02: {
    title: "미션 2",
    qr: "gamgok_mission_02",
    type: "blank"
  }
};

let completedMissions =
  JSON.parse(localStorage.getItem("completedMissions")) || [];

function saveLocal() {
  localStorage.setItem("gamgokUser", JSON.stringify(currentUser));
  localStorage.setItem("completedMissions", JSON.stringify(completedMissions));
}

async function saveToFirebase() {
  if (!currentUser) return;

  const userId = `${currentUser.name}_${currentUser.baptism}`;

  await setDoc(
    doc(db, "participants", userId),
    {
      name: currentUser.name,
      baptism: currentUser.baptism,
      completedMissions,
      updatedAt: new Date()
    },
    { merge: true }
  );
}

async function loadFromFirebase() {
  if (!currentUser) return;

  const userId = `${currentUser.name}_${currentUser.baptism}`;
  const snap = await getDoc(doc(db, "participants", userId));

  if (snap.exists()) {
    completedMissions = snap.data().completedMissions || [];
    saveLocal();
  }
}

function completeMission(missionId) {
  if (!completedMissions.includes(missionId)) {
    completedMissions.push(missionId);
    saveLocal();
    saveToFirebase();
  }
}

function injectStyle() {
  document.head.insertAdjacentHTML(
    "beforeend",
    `
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
        background: linear-gradient(#e8dcc4, #c9b58f);
        color: #2d2118;
      }

      button {
        border: none;
        border-radius: 16px;
        padding: 14px 20px;
        font-size: 17px;
        background: #6b4f32;
        color: white;
        cursor: pointer;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        padding: 15px;
        margin: 8px 0;
        border-radius: 14px;
        border: 1px solid #b9aa92;
        font-size: 17px;
      }

      .page {
        padding: 28px 20px;
        text-align: center;
      }

      .card {
        background: rgba(255,255,255,0.65);
        border-radius: 24px;
        padding: 24px;
        margin: 20px auto;
        max-width: 420px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      }

      .title {
        font-size: 34px;
        font-weight: 800;
        margin-bottom: 10px;
      }

      .subtitle {
        font-size: 18px;
        margin-bottom: 20px;
      }

      .progress {
        font-size: 22px;
        font-weight: 700;
        margin: 18px 0;
      }

      #reader {
        width: 100%;
        max-width: 420px;
        margin: 20px auto;
        border-radius: 24px;
        overflow: hidden;
      }

      .puzzle {
        width: 300px;
        height: 300px;
        margin: 20px auto;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 3px;
        background: #4a4035;
        padding: 3px;
        border-radius: 12px;
      }

      .piece {
        background-image: url("./puzzle.png");
        background-size: 300px 300px;
        border-radius: 6px;
        cursor: pointer;
        border: 2px solid transparent;
      }

      .selected {
        border: 2px solid #ffcc00;
      }

      .complete-img {
        width: 300px;
        max-width: 90%;
        border-radius: 18px;
        margin: 20px auto;
        display: block;
      }

      .blank-box {
        font-size: 24px;
        line-height: 1.8;
        margin: 20px 0;
      }

      .back {
        margin-top: 20px;
        background: #aaa;
        color: #222;
      }
    </style>
    `
  );
}

injectStyle();

function renderLogin() {
  app.innerHTML = `
    <div class="page">
      <div class="card">
        <div class="title">스탬프 투어</div>
        <div class="subtitle">이름과 세례명을 입력해주세요.</div>

        <input id="nameInput" placeholder="이름" />
        <input id="baptismInput" placeholder="세례명" />

        <button id="startBtn">입장하기</button>
      </div>
    </div>
  `;

  document.getElementById("startBtn").onclick = async () => {
    const name = document.getElementById("nameInput").value.trim();
    const baptism = document.getElementById("baptismInput").value.trim();

    if (!name || !baptism) {
      alert("이름과 세례명을 모두 입력해주세요.");
      return;
    }

    currentUser = { name, baptism };
    saveLocal();

    await loadFromFirebase();
    renderHome();
  };
}

function renderHome() {
  const total = Object.keys(MISSIONS).length;
  const done = completedMissions.length;

  app.innerHTML = `
    <div class="page">
      <div class="card">
        <div class="title">스탬프 투어</div>
        <div class="subtitle">${currentUser.name} ${currentUser.baptism}</div>

        <div class="progress">${done} / ${total} 완료</div>

        <button id="scanBtn">QR 스캔하기</button>
      </div>
    </div>
  `;

  document.getElementById("scanBtn").onclick = renderQrScanner;
}

function renderQrScanner() {
  app.innerHTML = `
    <div class="page">
      <h1>QR 스캔</h1>
      <p>카메라 권한을 허용해주세요.</p>

      <div id="reader"></div>

      <button class="back" id="backBtn">돌아가기</button>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => {
    stopQrScanner();
    renderHome();
  };

  qrScanner = new Html5QrcodeScanner("reader", {
    fps: 10,
    qrbox: 250
  });

  qrScanner.render(
    (decodedText) => {
      onScanSuccess(decodedText);
    },
    () => {}
  );
}

function stopQrScanner() {
  if (qrScanner) {
    qrScanner.clear().catch(() => {});
    qrScanner = null;
  }
}

function onScanSuccess(decodedText) {
  stopQrScanner();

  const qr = decodedText.trim();

  if (qr === "gamgok_mission_01") {
    renderPuzzleMission();
    return;
  }

  if (qr === "gamgok_mission_02") {
    renderMission02();
    return;
  }

  alert("등록되지 않은 QR 코드입니다.\n읽힌 내용: " + qr);
  renderHome();
}

function renderPuzzleMission() {
  if (completedMissions.includes("mission01")) {
    app.innerHTML = `
      <div class="page">
        <div class="card">
          <h1>미션 1 완료</h1>
          <p>이미 완료한 미션입니다.</p>
          <img src="./puzzle.png" class="complete-img" />
          <button id="homeBtn">메인으로</button>
        </div>
      </div>
    `;

    document.getElementById("homeBtn").onclick = renderHome;
    return;
  }

  let order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  let selected = null;

  app.innerHTML = `
    <div class="page">
      <div class="card">
        <h1>미션 1</h1>
        <p>그림 조각을 눌러 서로 바꾸며 퍼즐을 완성하세요.</p>

        <div class="puzzle" id="puzzle"></div>

        <button class="back" id="homeBtn">돌아가기</button>
      </div>
    </div>
  `;

  const puzzle = document.getElementById("puzzle");

  function drawPuzzle() {
    puzzle.innerHTML = "";

    order.forEach((pieceNumber, position) => {
      const piece = document.createElement("div");
      piece.className = "piece";
      piece.dataset.position = position;

      const x = pieceNumber % 3;
      const y = Math.floor(pieceNumber / 3);

      piece.style.backgroundPosition = `-${x * 100}px -${y * 100}px`;

      piece.onclick = () => {
        if (selected === null) {
          selected = position;
          piece.classList.add("selected");
        } else {
          const temp = order[selected];
          order[selected] = order[position];
          order[position] = temp;
          selected = null;
          drawPuzzle();
          checkPuzzle();
        }
      };

      puzzle.appendChild(piece);
    });
  }

  function checkPuzzle() {
    const solved = order.every((num, index) => num === index);

    if (solved) {
      completeMission("mission01");

      setTimeout(() => {
        app.innerHTML = `
          <div class="page">
            <div class="card">
              <h1>미션 1 완료!</h1>
              <p>퍼즐을 완성했습니다.</p>

              <img src="./puzzle.png" class="complete-img" />

              <button id="homeBtn">메인으로</button>
            </div>
          </div>
        `;

        document.getElementById("homeBtn").onclick = renderHome;
      }, 500);
    }
  }

  document.getElementById("homeBtn").onclick = renderHome;

  drawPuzzle();
}

function renderMission02() {
  if (completedMissions.includes("mission02")) {
    app.innerHTML = `
      <div class="page">
        <div class="card">
          <h1>미션 2 완료</h1>
          <p>이미 완료한 미션입니다.</p>
          <button id="homeBtn">메인으로</button>
        </div>
      </div>
    `;

    document.getElementById("homeBtn").onclick = renderHome;
    return;
  }

  app.innerHTML = `
    <div class="page">
      <div class="card">
        <h1>미션 2</h1>

        <div class="blank-box">
          아무것도 
          <input id="answerInput" placeholder="빈칸" style="width:120px;text-align:center;" />
          하지 마십시오.
        </div>

        <button id="submitBtn">정답 확인</button>
        <br />
        <button class="back" id="homeBtn">돌아가기</button>
      </div>
    </div>
  `;

  document.getElementById("submitBtn").onclick = () => {
    const answer = document.getElementById("answerInput").value.trim();

    if (answer === "걱정") {
      completeMission("mission02");

      app.innerHTML = `
        <div class="page">
          <div class="card">
            <h1>미션 2 완료!</h1>
            <p>정답입니다.</p>
            <button id="homeBtn">메인으로</button>
          </div>
        </div>
      `;

      document.getElementById("homeBtn").onclick = renderHome;
    } else {
      alert("다시 생각해보세요.");
    }
  };

  document.getElementById("homeBtn").onclick = renderHome;
}

function shuffle(array) {
  let newArray = [...array];

  do {
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
  } while (newArray.every((num, index) => num === index));

  return newArray;
}

if (currentUser) {
  loadFromFirebase().then(renderHome);
} else {
  renderLogin();
}