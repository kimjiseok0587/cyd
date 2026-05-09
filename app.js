import { db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = document.getElementById("app");

let qrScanner = null;

let currentUser =
  JSON.parse(localStorage.getItem("gamgokUser")) || null;

let completedMissions =
  JSON.parse(localStorage.getItem("completedMissions")) || [];

const MISSIONS = {
  mission01: {
    title: "미션 1",
    qr: "gamgok_mission_01"
  },

  mission02: {
    title: "미션 2",
    qr: "gamgok_mission_02"
  }
};

function saveLocal() {
  localStorage.setItem(
    "gamgokUser",
    JSON.stringify(currentUser)
  );

  localStorage.setItem(
    "completedMissions",
    JSON.stringify(completedMissions)
  );
}

async function loadFromFirebase() {
  if (!currentUser) return;

  const userId =
    `${currentUser.name}_${currentUser.baptism}`;

  const snap = await getDoc(
    doc(db, "participants", userId)
  );

  if (snap.exists()) {
    completedMissions =
      snap.data().completedMissions || [];

    saveLocal();
  }
}

async function saveToFirebase() {
  if (!currentUser) return;

  const userId =
    `${currentUser.name}_${currentUser.baptism}`;

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
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Apple SD Gothic Neo",
          sans-serif;

        background:
          linear-gradient(
            180deg,
            #eadcc0 0%,
            #c7ad7b 100%
          );

        color: #2d2118;
      }

      .page {
        min-height: 100vh;
        padding: 28px 18px;
        box-sizing: border-box;
      }

      button {
        border: none;
        border-radius: 18px;
        padding: 16px;
        font-size: 18px;
        font-weight: 800;
        cursor: pointer;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        padding: 15px;
        margin-top: 10px;
        border-radius: 14px;
        border: 1px solid #c6b28f;
        font-size: 17px;
      }

      .login-card,
      .passport-card,
      .card {
        max-width: 430px;
        margin: 0 auto;
        background: #f8edd8;
        border-radius: 28px;
        padding: 24px;
        box-shadow:
          0 12px 28px rgba(72,48,20,0.22);
      }

      .main-title {
        font-size: 32px;
        font-weight: 900;
      }

      .sub-title {
        color: #6f5737;
        margin-top: 6px;
      }

      .user-box {
        margin-top: 22px;
        padding: 18px;
        border-radius: 20px;
        background: rgba(255,255,255,0.65);
      }

      .user-name {
        font-size: 24px;
        font-weight: 800;
      }

      .user-baptism {
        margin-top: 5px;
        color: #6f5737;
      }

      .progress-box {
        margin-top: 20px;
        background: #fff9eb;
        padding: 20px;
        border-radius: 22px;
      }

      .progress-title {
        font-size: 17px;
        font-weight: 700;
      }

      .progress-number {
        margin-top: 8px;
        font-size: 36px;
        font-weight: 900;
      }

      .progress-bar {
        width: 100%;
        height: 16px;
        background: #dfceb1;
        border-radius: 999px;
        overflow: hidden;
        margin-top: 14px;
      }

      .progress-fill {
        height: 100%;
        background: #8b5a2b;
      }

      .progress-percent {
        margin-top: 8px;
        text-align: right;
        color: #6d573b;
      }

      .main-buttons {
        margin-top: 24px;
        display: grid;
        gap: 12px;
      }

      .scan-btn {
        background: #5a351b;
        color: white;
      }

      .map-btn {
        background: #d7b16a;
        color: #3a2814;
      }

      .reset-btn {
        background: #b53b3b;
        color: white;
      }

      .notice-card {
        max-width: 430px;
        margin: 18px auto 0;
        background: rgba(255,255,255,0.45);
        border-radius: 18px;
        padding: 16px;
        text-align: center;
      }

      #reader {
        width: 100%;
        max-width: 360px;
        margin: 20px auto;
        overflow: hidden;
        border-radius: 20px;
      }

      .map-box {
        margin: 20px auto;
        width: 100%;
        max-width: 350px;
        height: 300px;
        border-radius: 20px;
        background: #efe1bd;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 800;
      }

      .puzzle {
        width: 300px;
        height: 300px;
        margin: 20px auto;
        display: grid;
        grid-template-columns: repeat(3,1fr);
        grid-template-rows: repeat(3,1fr);
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
        border: 2px solid yellow;
      }

      .complete-img {
        width: 300px;
        max-width: 90%;
        display: block;
        margin: 20px auto;
        border-radius: 16px;
      }

      .back-btn {
        margin-top: 15px;
        background: #999;
        color: white;
      }

    </style>
  `
  );
}

injectStyle();

function renderLogin() {
  app.innerHTML = `
    <div class="page">

      <div class="login-card">

        <div class="main-title">
          스탬프 투어
        </div>

        <div class="sub-title">
          이름과 세례명을 입력하세요
        </div>

        <input
          id="nameInput"
          placeholder="이름"
        />

        <input
          id="baptismInput"
          placeholder="세례명"
        />

        <button
          id="startBtn"
          style="margin-top:18px;width:100%;background:#5a351b;color:white;"
        >
          입장하기
        </button>

      </div>

    </div>
  `;

  document.getElementById("startBtn").onclick =
    async () => {

      const name =
        document.getElementById("nameInput")
        .value.trim();

      const baptism =
        document.getElementById("baptismInput")
        .value.trim();

      if (!name || !baptism) {
        alert("이름과 세례명을 입력하세요");
        return;
      }

      currentUser = {
        name,
        baptism
      };

      saveLocal();

      await loadFromFirebase();

      renderHome();
    };
}

function renderHome() {

  const total =
    Object.keys(MISSIONS).length;

  const done =
    completedMissions.length;

  const percent =
    Math.round((done / total) * 100);

  app.innerHTML = `
    <div class="page">

      <div class="passport-card">

        <div class="main-title">
          미션 스탬프 투어
        </div>

        <div class="sub-title">
          감곡성당 청소년대회
        </div>

        <div class="user-box">
          <div class="user-name">
            ${currentUser.name}
          </div>

          <div class="user-baptism">
            ${currentUser.baptism}
          </div>
        </div>

        <div class="progress-box">

          <div class="progress-title">
            미션 진행도
          </div>

          <div class="progress-number">
            ${done} / ${total}
          </div>

          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width:${percent}%"
            ></div>
          </div>

          <div class="progress-percent">
            ${percent}% 완료
          </div>

        </div>

        <div class="main-buttons">

          <button
            class="scan-btn"
            id="scanBtn"
          >
            📷 QR 스캔하기
          </button>

          <button
            class="map-btn"
            id="mapBtn"
          >
            🗺️ 지도 보기
          </button>

          <button
            class="reset-btn"
            id="resetBtn"
          >
            🔄 처음으로
          </button>

        </div>

      </div>

      <div class="notice-card">
        장소에 있는 QR을 찍으면
        해당 미션이 시작됩니다.
      </div>

    </div>
  `;

  document.getElementById("scanBtn").onclick =
    renderQrScanner;

  document.getElementById("mapBtn").onclick =
    renderMap;

  document.getElementById("resetBtn").onclick =
    () => {

      if (
        confirm("처음부터 다시 시작할까요?")
      ) {

        completedMissions = [];

        saveLocal();

        saveToFirebase();

        renderHome();
      }
    };
}

function renderMap() {

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>지도 보기</h1>

        <div class="map-box">
          🗺️ 지도 이미지
        </div>

        <button
          class="back-btn"
          id="homeBtn"
        >
          메인으로
        </button>

      </div>

    </div>
  `;

  document.getElementById("homeBtn").onclick =
    renderHome;
}

function renderQrScanner() {

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>QR 스캔</h1>

        <p>
          QR 코드를 비춰주세요
        </p>

        <div id="reader"></div>

        <button
          class="back-btn"
          id="homeBtn"
        >
          메인으로
        </button>

      </div>

    </div>
  `;

  document.getElementById("homeBtn").onclick =
    () => {

      stopQrScanner();

      renderHome();
    };

  qrScanner =
    new Html5Qrcode("reader");

  qrScanner.start(
    {
      facingMode: "user"
    },
    {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250
      }
    },
    (decodedText) => {

      onScanSuccess(decodedText);

    },
    () => {}
  );
}

function stopQrScanner() {

  if (qrScanner) {

    qrScanner.stop()
      .then(() => {

        qrScanner.clear();

        qrScanner = null;
      })
      .catch(() => {

        qrScanner = null;
      });
  }
}

function onScanSuccess(decodedText) {

  stopQrScanner();

  const qr =
    decodedText.trim();

  if (qr === "gamgok_mission_01") {

    renderPuzzleMission();

    return;
  }

  if (qr === "gamgok_mission_02") {

    renderMission02();

    return;
  }

  alert(
    "등록되지 않은 QR 코드입니다"
  );

  renderHome();
}

function renderPuzzleMission() {

  if (
    completedMissions.includes(
      "mission01"
    )
  ) {

    app.innerHTML = `
      <div class="page">

        <div class="card">

          <h1>
            미션 1 완료
          </h1>

          <img
            src="./puzzle.png"
            class="complete-img"
          />

          <button
            id="homeBtn"
          >
            메인으로
          </button>

        </div>

      </div>
    `;

    document.getElementById("homeBtn").onclick =
      renderHome;

    return;
  }

  let order =
    shuffle([
      0,1,2,
      3,4,5,
      6,7,8
    ]);

  let selected = null;

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>
          미션 1
        </h1>

        <p>
          퍼즐을 완성하세요
        </p>

        <div
          class="puzzle"
          id="puzzle"
        ></div>

        <button
          class="back-btn"
          id="homeBtn"
        >
          메인으로
        </button>

      </div>

    </div>
  `;

  const puzzle =
    document.getElementById(
      "puzzle"
    );

  function drawPuzzle() {

    puzzle.innerHTML = "";

    order.forEach(
      (
        pieceNumber,
        position
      ) => {

        const piece =
          document.createElement("div");

        piece.className =
          "piece";

        const x =
          pieceNumber % 3;

        const y =
          Math.floor(
            pieceNumber / 3
          );

        piece.style.backgroundPosition =
          `-${x * 100}px -${y * 100}px`;

        piece.onclick = () => {

          if (
            selected === null
          ) {

            selected =
              position;

            piece.classList.add(
              "selected"
            );

          } else {

            const temp =
              order[selected];

            order[selected] =
              order[position];

            order[position] =
              temp;

            selected = null;

            drawPuzzle();

            checkPuzzle();
          }
        };

        puzzle.appendChild(piece);
      }
    );
  }

  function checkPuzzle() {

    const solved =
      order.every(
        (
          num,
          index
        ) =>
          num === index
      );

    if (solved) {

      completeMission(
        "mission01"
      );

      setTimeout(() => {

        app.innerHTML = `
          <div class="page">

            <div class="card">

              <h1>
                미션 완료!
              </h1>

              <img
                src="./puzzle.png"
                class="complete-img"
              />

              <button
                id="homeBtn"
              >
                메인으로
              </button>

            </div>

          </div>
        `;

        document.getElementById(
          "homeBtn"
        ).onclick =
          renderHome;

      }, 500);
    }
  }

  document.getElementById(
    "homeBtn"
  ).onclick =
    renderHome;

  drawPuzzle();
}

function renderMission02() {

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>
          미션 2
        </h1>

        <p>
          빈칸을 채우세요
        </p>

        <div
          style="
            font-size:24px;
            margin:25px 0;
          "
        >
          아무것도

          <input
            id="answerInput"
            placeholder="빈칸"
            style="
              width:120px;
              text-align:center;
            "
          />

          하지 마십시오.
        </div>

        <button
          id="submitBtn"
        >
          정답 확인
        </button>

        <button
          class="back-btn"
          id="homeBtn"
        >
          메인으로
        </button>

      </div>

    </div>
  `;

  document.getElementById(
    "submitBtn"
  ).onclick = () => {

    const answer =
      document.getElementById(
        "answerInput"
      )
      .value
      .trim();

    if (
      answer === "걱정"
    ) {

      completeMission(
        "mission02"
      );

      app.innerHTML = `
        <div class="page">

          <div class="card">

            <h1>
              미션 완료!
            </h1>

            <p>
              정답입니다
            </p>

            <button
              id="homeBtn"
            >
              메인으로
            </button>

          </div>

        </div>
      `;

      document.getElementById(
        "homeBtn"
      ).onclick =
        renderHome;

    } else {

      alert(
        "다시 생각해보세요"
      );
    }
  };

  document.getElementById(
    "homeBtn"
  ).onclick =
    renderHome;
}

function shuffle(array) {

  let newArray =
    [...array];

  do {

    for (
      let i =
        newArray.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(
          Math.random() *
          (i + 1)
        );

      [
        newArray[i],
        newArray[j]
      ] = [
        newArray[j],
        newArray[i]
      ];
    }

  } while (
    newArray.every(
      (
        num,
        index
      ) =>
        num === index
    )
  );

  return newArray;
}

if (currentUser) {

  loadFromFirebase()
    .then(
      renderHome
    );

} else {

  renderLogin();
}