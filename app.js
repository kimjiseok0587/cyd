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

let completedMissions = [];

const MISSIONS = {
  mission01: {
    title: "미션 1",
    qr: "gamgok_mission_01"
  },

  mission02: {
    title: "미션 2",
    qr: "gamgok_mission_02"
  },

  mission03: {
    title: "미션 3",
    qr: "gamgok_mission_03"
  },

  mission04: {
    title: "미션 4",
    qr: "gamgok_mission_04"
  },

  mission05: {
    title: "미션 5",
    qr: "gamgok_mission_05"
  },

  mission06: {
    title: "미션 6",
    qr: "gamgok_mission_06"
  },

  mission07: {
  title: "미션 7",
  qr: "gamgok_mission_07"
},

mission08: {
  title: "미션 8",
  qr: "gamgok_mission_08"
},

mission09: {
  title: "미션 9",
  qr: "gamgok_mission_09"
},

mission10: {
  title: "미션 10",
  qr: "gamgok_mission_10"
},

mission11: {
  title: "미션 11",
  qr: "gamgok_mission_11"
},

mission12: {
  title: "미션 12",
  qr: "gamgok_mission_12"
},

mission13: {
  title: "미션 13",
  qr: "gamgok_mission_13"
},

mission14: {
  title: "미션 14",
  qr: "gamgok_mission_14"
},

mission15: {
  title: "미션 15",
  qr: "gamgok_mission_15"
},

mission16: {
  title: "미션 16",
  qr: "gamgok_mission_16"
},

mission17: {
  title: "미션 17",
  qr: "gamgok_mission_17"
},

mission18: {
  title: "미션 18",
  qr: "gamgok_mission_18"
},

mission19: {
  title: "미션 19",
  qr: "gamgok_mission_19"
},

mission20: {
  title: "미션 20",
  qr: "gamgok_mission_20"
}
};

const mission3Answers = [
  { x: 0.08, y: 0.16, r: 0.06 },
  { x: 0.54, y: 0.31, r: 0.05 },
  { x: 0.65, y: 0.48, r: 0.06 },
  { x: 0.89, y: 0.82, r: 0.08 },
  { x: 0.90, y: 0.13, r: 0.06 }
];

function getUserId() {
  if (!currentUser) return null;
  return `${currentUser.name}_${currentUser.baptism}`;
}

function getProgressKey() {
  const userId = getUserId();
  return userId ? `completedMissions_${userId}` : null;
}

function saveLocal() {
  localStorage.setItem(
    "gamgokUser",
    JSON.stringify(currentUser)
  );

  const progressKey = getProgressKey();

  if (progressKey) {
    localStorage.setItem(
      progressKey,
      JSON.stringify(completedMissions)
    );
  }
}

async function loadFromFirebase() {
  if (!currentUser) return;

  const userId = getUserId();
  const progressKey = getProgressKey();

  const localProgress =
    JSON.parse(localStorage.getItem(progressKey)) || [];

  const snap = await getDoc(
    doc(db, "participants", userId)
  );

  if (snap.exists()) {
    completedMissions =
      snap.data().completedMissions || [];
  } else {
    completedMissions = localProgress;
  }

  saveLocal();
}

async function saveToFirebase() {
  if (!currentUser) return;

  const userId = getUserId();

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

      .mission3-wrap {
        position: relative;
        width: 100%;
        max-width: 390px;
        margin: 18px auto;
      }

      .mission3-img {
        width: 100%;
        display: block;
        border-radius: 16px;
      }

      .answer-dot {
        position: absolute;
        width: 30px;
        height: 30px;
        border: 4px solid red;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        box-sizing: border-box;
      }

      .found-count {
        margin-top: 12px;
        font-size: 20px;
        font-weight: 900;
        text-align: center;
      }

      .line-game {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
        margin-top: 24px;
      }

      .line-list {
        display: grid;
        gap: 14px;
      }

      .match-btn {
        background: #fff9eb;
        color: #2d2118;
        border: 2px solid #d4b987;
      }

      .match-btn.selected {
        background: #ffd86b;
        border-color: #8b5a2b;
      }

      .match-result {
        margin-top: 18px;
        font-size: 20px;
        font-weight: 900;
        text-align: center;
      }

      .success-text {
        color: #1d7a32;
      }

      .fail-text {
        color: #b53b3b;
      }

      .date-box {
        margin-top: 20px;
        padding: 18px;
        border-radius: 20px;
        background: #fff9eb;
      }

      .date-box h2 {
        margin: 0 0 12px;
        font-size: 22px;
      }

      .date-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr auto;
        gap: 8px;
        align-items: center;
      }

      .date-row select {
        width: 100%;
        padding: 12px 6px;
        border-radius: 12px;
        border: 1px solid #c6b28f;
        font-size: 18px;
        font-weight: 800;
        text-align: center;
        background: white;
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

      completedMissions = [];

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

  document.getElementById("resetBtn").onclick = () => {
    if (confirm("로그인 화면으로 돌아갈까요?")) {
      stopQrScanner();

      currentUser = null;
      completedMissions = [];

      localStorage.removeItem("gamgokUser");

      renderLogin();
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
      facingMode: "environment"
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
  ).catch(() => {
    alert("카메라를 실행할 수 없습니다. 카메라 권한을 확인해주세요.");
    renderHome();
  });
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

  if (qr === "gamgok_mission_03") {
    renderMission03();
    return;
  }

  if (qr === "gamgok_mission_04") {
    renderMission04();
    return;
  }

  if (qr === "gamgok_mission_05") {
    renderMission05();
    return;
  }

  if (qr === "gamgok_mission_06") {
    renderMission06();
    return;
  }

  if (qr === "gamgok_mission_07") {
  renderMission07();
  return;
}

if (qr === "gamgok_mission_08") {
  renderMission08();
  return;
}

if (qr === "gamgok_mission_09") {
  renderMission09();
  return;
}

if (qr === "gamgok_mission_10") {
  renderMission10();
  return;
}

if (qr === "gamgok_mission_11") {
  renderMission11();
  return;
}

if (qr === "gamgok_mission_12") {
  renderMission12();
  return;
}

if (qr === "gamgok_mission_13") {
  renderMission13();
  return;
}

if (qr === "gamgok_mission_14") {
  renderMission14();
  return;
}

if (qr === "gamgok_mission_15") {
  renderMission15();
  return;
}

if (qr === "gamgok_mission_16") {
  renderMission16();
  return;
}

if (qr === "gamgok_mission_17") {
  renderMission17();
  return;
}

if (qr === "gamgok_mission_18") {
  renderMission18();
  return;
}

if (qr === "gamgok_mission_19") {
  renderMission19();
  return;
}

if (qr === "gamgok_mission_20") {
  renderMission20();
  return;
}

  try {
    const url = new URL(qr);
    const mission = url.searchParams.get("mission");

    if (mission === "1") {
      renderPuzzleMission();
      return;
    }

    if (mission === "2") {
      renderMission02();
      return;
    }

    if (mission === "3") {
      renderMission03();
      return;
    }

    if (mission === "4") {
      renderMission04();
      return;
    }

    if (mission === "5") {
      renderMission05();
      return;
    }

    if (mission === "6") {
      renderMission06();
      return;
    }

    if (mission === "7") {
  renderMission07();
  return;
}

if (mission === "8") {
  renderMission08();
  return;
}

if (mission === "9") {
  renderMission09();
  return;
}

if (mission === "10") {
  renderMission10();
  return;
}

if (mission === "11") {
  renderMission11();
  return;
}

if (mission === "12") {
  renderMission12();
  return;
}

if (mission === "13") {
  renderMission13();
  return;
}

if (mission === "14") {
  renderMission14();
  return;
}

if (mission === "15") {
  renderMission15();
  return;
}

if (mission === "16") {
  renderMission16();
  return;
}

if (mission === "17") {
  renderMission17();
  return;
}

if (mission === "18") {
  renderMission18();
  return;
}

if (mission === "19") {
  renderMission19();
  return;
}

if (mission === "20") {
  renderMission20();
  return;
}

  } catch (e) {}

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

function renderMission03() {
  if (
    completedMissions.includes(
      "mission03"
    )
  ) {
    app.innerHTML = `
      <div class="page">

        <div class="card">

          <h1>
            미션 3 완료
          </h1>

          <p>
            틀린그림 찾기를 완료했습니다.
          </p>

          <img
            src="./mission3_wrong.png"
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

  let found = [];

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>
          미션 3
        </h1>

        <p>
          틀린 곳 5군데를 찾아 누르세요
        </p>

        <div
          class="mission3-wrap"
          id="mission3Wrap"
        >
          <img
            src="./mission3_wrong.png"
            class="mission3-img"
            id="mission3Img"
          />
        </div>

        <div
          class="found-count"
          id="foundCount"
        >
          0 / 5
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

  const wrap =
    document.getElementById("mission3Wrap");

  const img =
    document.getElementById("mission3Img");

  const foundCount =
    document.getElementById("foundCount");

  img.onclick = (event) => {
    const rect =
      img.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width;

    const y =
      (event.clientY - rect.top) / rect.height;

    mission3Answers.forEach(
      (answer, index) => {
        if (found.includes(index)) return;

        const dx =
          x - answer.x;

        const dy =
          y - answer.y;

        const distance =
          Math.sqrt(dx * dx + dy * dy);

        if (distance <= answer.r) {
          found.push(index);

          const dot =
            document.createElement("div");

          dot.className =
            "answer-dot";

          dot.style.left =
            `${answer.x * 100}%`;

          dot.style.top =
            `${answer.y * 100}%`;

          wrap.appendChild(dot);

          foundCount.textContent =
            `${found.length} / 5`;

          if (found.length === 5) {
            completeMission("mission03");

            setTimeout(() => {
              app.innerHTML = `
                <div class="page">

                  <div class="card">

                    <h1>
                      미션 완료!
                    </h1>

                    <p>
                      틀린 곳 5군데를 모두 찾았습니다.
                    </p>

                    <img
                      src="./mission3_wrong.png"
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
      }
    );
  };

  document.getElementById(
    "homeBtn"
  ).onclick =
    renderHome;
}

function renderMission04() {
  if (
    completedMissions.includes(
      "mission04"
    )
  ) {
    app.innerHTML = `
      <div class="page">

        <div class="card">

          <h1>
            미션 4 완료
          </h1>

          <p>
            선 연결 미션을 완료했습니다.
          </p>

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

  const correctAnswer = {
    "마리아": "도",
    "데레사": "레",
    "벨라뎃다": "미"
  };

  let selectedName = null;
  let answers = {};

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>
          미션 4
        </h1>

        <p>
          왼쪽 이름과 오른쪽 계이름을 알맞게 연결하세요
        </p>

        <div class="line-game">

          <div class="line-list">
            <button
              class="match-btn left-match"
              data-name="마리아"
            >
              마리아
            </button>

            <button
              class="match-btn left-match"
              data-name="데레사"
            >
              데레사
            </button>

            <button
              class="match-btn left-match"
              data-name="벨라뎃다"
            >
              벨라뎃다
            </button>
          </div>

          <div class="line-list">
            <button
              class="match-btn right-match"
              data-note="미"
            >
              미
            </button>

            <button
              class="match-btn right-match"
              data-note="레"
            >
              레
            </button>

            <button
              class="match-btn right-match"
              data-note="도"
            >
              도
            </button>
          </div>

        </div>

        <div
          class="match-result"
          id="matchResult"
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

  document.querySelectorAll(".left-match")
    .forEach((btn) => {
      btn.onclick = () => {
        selectedName =
          btn.dataset.name;

        document.querySelectorAll(".left-match")
          .forEach((b) => {
            b.classList.remove("selected");
          });

        btn.classList.add("selected");
      };
    });

  document.querySelectorAll(".right-match")
    .forEach((btn) => {
      btn.onclick = () => {
        if (!selectedName) {
          alert("먼저 왼쪽 이름을 선택하세요");
          return;
        }

        const note =
          btn.dataset.note;

        answers[selectedName] =
          note;

        const leftBtn =
          document.querySelector(
            `[data-name="${selectedName}"]`
          );

        leftBtn.textContent =
          `${selectedName} → ${note}`;

        leftBtn.classList.remove("selected");

        selectedName = null;

        checkMission04();
      };
    });

  function checkMission04() {
    const names = [
      "마리아",
      "데레사",
      "벨라뎃다"
    ];

    if (
      names.every(
        name => answers[name]
      )
    ) {
      const isCorrect =
        names.every(
          name =>
            answers[name] ===
            correctAnswer[name]
        );

      if (isCorrect) {
        completeMission("mission04");

        document.getElementById("matchResult")
          .innerHTML = `
            <span class="success-text">
              정답입니다! 미션 완료!
            </span>
          `;

        setTimeout(() => {
          renderHome();
        }, 800);

      } else {
        document.getElementById("matchResult")
          .innerHTML = `
            <span class="fail-text">
              틀렸습니다. 다시 연결해보세요.
            </span>
          `;

        setTimeout(() => {
          renderMission04();
        }, 1000);
      }
    }
  }

  document.getElementById("homeBtn").onclick =
    renderHome;
}

function renderMission05() {
  if (
    completedMissions.includes(
      "mission05"
    )
  ) {
    app.innerHTML = `
      <div class="page">

        <div class="card">

          <h1>
            미션 5 완료
          </h1>

          <p>
            이미 완료한 미션입니다.
          </p>

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

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>
          미션 5
        </h1>

        <p style="font-weight:700; font-size:20px; line-height:1.5;">
          감곡성당과 매괴장미 안내판을 읽고,<br>
          안내판에 <b>"매"</b>가 몇 번 들어가나요?
        </p>

        <input
          id="mission05Answer"
          type="number"
          placeholder="숫자만 입력하세요"
          style="
            margin-top:20px;
            text-align:center;
            font-size:24px;
            font-weight:800;
          "
        />

        <button
          id="mission05SubmitBtn"
          style="
            margin-top:18px;
            width:100%;
            background:#5a351b;
            color:white;
          "
        >
          정답 확인
        </button>

        <button
          class="back-btn"
          id="homeBtn"
          style="margin-top:14px;width:100%;"
        >
          메인으로
        </button>

      </div>

    </div>
  `;

  document.getElementById("mission05SubmitBtn").onclick = () => {
    const answer =
      document.getElementById("mission05Answer")
      .value
      .trim();

    if (answer === "11") {
      completeMission("mission05");

      app.innerHTML = `
        <div class="page">

          <div class="card">

            <h1>
              미션 완료!
            </h1>

            <p>
              정답입니다! 안내판의 "매"는 총 11번 들어갑니다.
            </p>

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

    } else {
      alert("틀렸습니다. 다시 안내판을 잘 읽어보세요.");
    }
  };

  document.getElementById("homeBtn").onclick =
    renderHome;
}

function renderMission06() {
  if (
    completedMissions.includes(
      "mission06"
    )
  ) {
    app.innerHTML = `
      <div class="page">

        <div class="card">

          <h1>
            미션 6 완료
          </h1>

          <p>
            이미 완료한 미션입니다.
          </p>

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

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>
          미션 6
        </h1>

        <p style="font-weight:700; font-size:20px; line-height:1.5;">
          임가밀로 신부님이 태어나신 날과<br>
          돌아가신 날은?
        </p>

        <div class="date-box">
          <h2>태어나신 날</h2>

          <div class="date-row">
            <select id="birthYear"></select>
            <span>년</span>

            <select id="birthMonth"></select>
            <span>월</span>

            <select id="birthDay"></select>
            <span>일</span>
          </div>
        </div>

        <div class="date-box">
          <h2>돌아가신 날</h2>

          <div class="date-row">
            <select id="deathYear"></select>
            <span>년</span>

            <select id="deathMonth"></select>
            <span>월</span>

            <select id="deathDay"></select>
            <span>일</span>
          </div>
        </div>

        <button
          id="mission06SubmitBtn"
          style="
            margin-top:18px;
            width:100%;
            background:#5a351b;
            color:white;
          "
        >
          정답 확인
        </button>

        <button
          class="back-btn"
          id="homeBtn"
          style="margin-top:14px;width:100%;"
        >
          메인으로
        </button>

      </div>

    </div>
  `;

  fillSelect("birthYear", 1800, 2000, 1800);
  fillSelect("birthMonth", 1, 12, 1);
  fillSelect("birthDay", 1, 31, 1);

  fillSelect("deathYear", 1800, 2000, 1800);
  fillSelect("deathMonth", 1, 12, 1);
  fillSelect("deathDay", 1, 31, 1);

  document.getElementById("mission06SubmitBtn").onclick = () => {
    const birthYear =
      document.getElementById("birthYear").value;

    const birthMonth =
      document.getElementById("birthMonth").value;

    const birthDay =
      document.getElementById("birthDay").value;

    const deathYear =
      document.getElementById("deathYear").value;

    const deathMonth =
      document.getElementById("deathMonth").value;

    const deathDay =
      document.getElementById("deathDay").value;

    if (
      birthYear === "1869" &&
      birthMonth === "12" &&
      birthDay === "19" &&
      deathYear === "1947" &&
      deathMonth === "10" &&
      deathDay === "25"
    ) {
      completeMission("mission06");

      app.innerHTML = `
        <div class="page">

          <div class="card">

            <h1>
              미션 완료!
            </h1>

            <p>
              정답입니다!<br>
              임가밀로 신부님은 1869년 12월 19일에 태어나시고,<br>
              1947년 10월 25일에 돌아가셨습니다.
            </p>

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

    } else {
      alert("틀렸습니다. 다시 맞춰보세요.");
    }
  };

  document.getElementById("homeBtn").onclick =
    renderHome;
}

function renderMission07() {
  if (
    completedMissions.includes(
      "mission07"
    )
  ) {
    app.innerHTML = `
      <div class="page">
        <div class="card">

          <h1>
            미션 7 완료
          </h1>

          <p>
            이미 완료한 미션입니다.
          </p>

          <button id="homeBtn">
            메인으로
          </button>

        </div>
      </div>
    `;

    document.getElementById("homeBtn").onclick =
      renderHome;

    return;
  }

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>
          미션 7
        </h1>

        <p style="font-weight:700; font-size:20px; line-height:1.5;">
          임가밀로 신부님의 소속은 어디였나요?
        </p>

        <div class="main-buttons">

          <button onclick="checkMission07(1)">
            1. 메리놀회
          </button>

          <button onclick="checkMission07(2)">
            2. 파리 외방 전교회
          </button>

          <button onclick="checkMission07(3)">
            3. 골롬반회
          </button>

          <button onclick="checkMission07(4)">
            4. 프란치스코전교봉사수도회
          </button>

        </div>

        <button
          class="back-btn"
          id="homeBtn"
          style="margin-top:14px;width:100%;"
        >
          메인으로
        </button>

      </div>

    </div>
  `;

  document.getElementById("homeBtn").onclick =
    renderHome;
}

window.checkMission07 = function(choice) {

  if (choice === 2) {

    completeMission("mission07");

    app.innerHTML = `
      <div class="page">

        <div class="card">

          <h1>
            미션 완료!
          </h1>

          <p>
            정답입니다!<br>
            임가밀로 신부님은 파리 외방 전교회 소속입니다.
          </p>

          <button id="homeBtn">
            메인으로
          </button>

        </div>

      </div>
    `;

    document.getElementById("homeBtn").onclick =
      renderHome;

  } else {
    alert("틀렸습니다. 다시 선택해보세요.");
  }
};

function renderMission08() {
  if (
    completedMissions.includes(
      "mission08"
    )
  ) {
    app.innerHTML = `
      <div class="page">
        <div class="card">

          <h1>
            미션 8 완료
          </h1>

          <p>
            이미 완료한 미션입니다.
          </p>

          <button id="homeBtn">
            메인으로
          </button>

        </div>
      </div>
    `;

    document.getElementById("homeBtn").onclick =
      renderHome;

    return;
  }

  app.innerHTML = `
    <div class="page">

      <div class="card">

        <h1>
          미션 8
        </h1>

        <p style="font-weight:700; font-size:20px; line-height:1.5;">
          감곡성당에는 김대건 신부님의 유해가 있습니다.<br>
          김대건 신부님의 어느 부위인가요?
        </p>

        <input
          id="mission08Answer"
          placeholder="정답 입력"
        />

        <button
          id="mission08SubmitBtn"
          style="margin-top:18px;width:100%;background:#5a351b;color:white;"
        >
          정답 확인
        </button>

        <button
          class="back-btn"
          id="homeBtn"
          style="margin-top:14px;width:100%;"
        >
          메인으로
        </button>

      </div>

    </div>
  `;

  document.getElementById("mission08SubmitBtn").onclick = () => {
    const answer =
      document.getElementById("mission08Answer")
      .value
      .trim()
      .replace(/\s/g, "");

    if (answer === "척추뼈") {
      completeMission("mission08");

      app.innerHTML = `
        <div class="page">

          <div class="card">

            <h1>
              미션 완료!
            </h1>

            <p>
              정답입니다!<br>
              김대건 신부님의 유해는 척추뼈입니다.
            </p>

            <button id="homeBtn">
              메인으로
            </button>

          </div>

        </div>
      `;

      document.getElementById("homeBtn").onclick =
        renderHome;

    } else {
      alert("틀렸습니다. 다시 입력해보세요.");
    }
  };

  document.getElementById("homeBtn").onclick =
    renderHome;
}

function renderMission09() {
  app.innerHTML = `
    <div class="mission-box">
      <h2>미션 9</h2>
      <p>임 가밀로 신부님이 태어나신 곳은 어디인가요?</p>

      <div class="quiz-options">
        <button onclick="checkMission09(1)">
          1. 프랑스 타르브교구 빌레아두르
        </button>

        <button onclick="checkMission09(2)">
          2. 이탈리아 로마
        </button>

        <button onclick="checkMission09(3)">
          3. 독일 베를린
        </button>

        <button onclick="checkMission09(4)">
          4. 중국 상하이
        </button>
      </div>
    </div>
  `;
}

window.checkMission09 = function(answer) {
  if (answer === 1) {
    completeMission("mission09");
  } else {
    alert("틀렸습니다!");
  }
};

function renderMission10() {

  const words = ["성당", "감곡", "순례지", "매괴", "성모"];

  app.innerHTML = `
    <div class="mission-box">
      <h2>미션 10</h2>

      <p>
        2006년 10월 7일 장봉훈 가브리엘 주교님이 승인하고 선포한 곳의 이름을
        순서대로 배열하세요.
      </p>

      <div id="word-bank" class="word-bank">
        ${words.map(word => `
          <button class="word-btn" onclick="selectWord('${word}')">
            ${word}
          </button>
        `).join("")}
      </div>

      <h3>배열한 답</h3>

      <div id="answer-area" class="answer-area"></div>

      <button class="submit-btn" onclick="checkMission10()">
        정답 확인
      </button>
    </div>
  `;
}

let mission10Answer = [];

window.selectWord = function(word) {

  mission10Answer.push(word);

  document.getElementById("answer-area").innerHTML =
    mission10Answer.map(w => `
      <span class="answer-word">${w}</span>
    `).join("");
};

window.checkMission10 = function() {

  const correct =
    "감곡매괴성모순례지성당";

  const userAnswer =
    mission10Answer.join("");

  if (userAnswer === correct) {

    completeMission("mission10");

  } else {

    alert("순서가 틀렸습니다!");
  }
};

function renderMission11() {
  app.innerHTML = `
    <div class="mission-box">
      <h2>미션 11</h2>

      <p>
        성체대회는 1914년부터 매년 거행해왔습니다.<br><br>

        그런데 ??????에 5회를 못했습니다.<br><br>

        언제일까요?
      </p>

      <input
        type="text"
        id="mission11Answer"
        placeholder="정답 입력"
        class="answer-input"
      />

      <br><br>

      <button onclick="checkMission11()" class="submit-btn">
        정답 확인
      </button>
    </div>
  `;
}

window.checkMission11 = function() {

  const answer =
    document.getElementById("mission11Answer")
      .value
      .replace(/\s/g, "")
      .trim();

  const correctAnswers = [
    "일제강점기말",
    "일제강점기",
    "일제강점기말기"
  ];

  if (correctAnswers.includes(answer)) {

    completeMission("mission11");

  } else {

    alert("틀렸습니다!");
  }
};

function renderMission12() {
  app.innerHTML = `
    <div class="mission-box">
      <h2>미션 12</h2>

      <p>
        성당 종탑에 시계가 있습니다.<br><br>
        그런데 진짜 시계가 아니라 그림으로 그려진 시계입니다 😂<br><br>
        그렇다면 그림으로 그려져 있지 않은 시간은 언제일까요?
      </p>

      <div class="quiz-options">
        <button onclick="checkMission12(1)">1. 3시</button>
        <button onclick="checkMission12(2)">2. 6시</button>
        <button onclick="checkMission12(3)">3. 9시</button>
        <button onclick="checkMission12(4)">4. 11시 55분</button>
        <button onclick="checkMission12(5)">5. 12시</button>
      </div>
    </div>
  `;
}

window.checkMission12 = function(answer) {
  if (answer === 5) {
    completeMission("mission12");
  } else {
    alert("틀렸습니다!");
  }
};

function renderMission13() {
  app.innerHTML = `
    <div class="mission-box">
      <h2>미션 13</h2>

      <p>
        감곡성당과 박물관 건물 앞을 보면<br>
        건축한 년도가 적혀있습니다!<br><br>

        성당 건축 년도와 박물관 건축 년도를<br>
        합치면 얼마일까요?
      </p>

      <div class="date-box">
        <h3>숫자를 맞춰보세요</h3>

        <div class="date-select-row">

          <select id="digit1">
            ${[0,1,2,3,4,5,6,7,8,9]
              .map(n => `<option value="${n}">${n}</option>`)
              .join("")}
          </select>

          <select id="digit2">
            ${[0,1,2,3,4,5,6,7,8,9]
              .map(n => `<option value="${n}">${n}</option>`)
              .join("")}
          </select>

          <select id="digit3">
            ${[0,1,2,3,4,5,6,7,8,9]
              .map(n => `<option value="${n}">${n}</option>`)
              .join("")}
          </select>

          <select id="digit4">
            ${[0,1,2,3,4,5,6,7,8,9]
              .map(n => `<option value="${n}">${n}</option>`)
              .join("")}
          </select>

        </div>
      </div>

      <button class="submit-btn" onclick="checkMission13()">
        정답 확인
      </button>
    </div>
  `;
}

window.checkMission13 = function() {

  const answer =
    document.getElementById("digit1").value +
    document.getElementById("digit2").value +
    document.getElementById("digit3").value +
    document.getElementById("digit4").value;

  if (answer === "3854") {

    completeMission("mission13");

  } else {

    alert("틀렸습니다!");
  }
};


function renderMission14() {

  const words = [
    "전부터",
    "사랑했습니다",
    "나는",
    "만나기",
    "여러분을"
  ];

  app.innerHTML = `
    <div class="mission-box">
      <h2>미션 14</h2>

      <p>
        임 가밀로 신부님 동상 아래 적힌<br>
        신부님의 말씀을 순서대로 나열하세요.
      </p>

      <div id="word-bank" class="word-bank">
        ${words.map(word => `
          <button class="word-btn" onclick="selectMission14Word('${word}')">
            ${word}
          </button>
        `).join("")}
      </div>

      <h3>배열한 답</h3>

      <div id="mission14-answer" class="answer-area"></div>

      <button class="submit-btn" onclick="checkMission14()">
        정답 확인
      </button>
    </div>
  `;
}

let mission14Answer = [];

window.selectMission14Word = function(word) {

  mission14Answer.push(word);

  document.getElementById("mission14-answer").innerHTML =
    mission14Answer.map(w => `
      <span class="answer-word">${w}</span>
    `).join("");
};

window.checkMission14 = function() {

  const correct =
    "나는여러분을만나기전부터사랑했습니다";

  const userAnswer =
    mission14Answer.join("");

  if (userAnswer === correct) {

    completeMission("mission14");

  } else {

    alert("순서가 틀렸습니다!");
  }
};


//여기 위에 문제 추가하면 됨
function fillSelect(id, start, end, selectedValue) {
  const select =
    document.getElementById(id);

  for (
    let i = start;
    i <= end;
    i++
  ) {
    const option =
      document.createElement("option");

    option.value =
      String(i);

    option.textContent =
      String(i);

    if (i === selectedValue) {
      option.selected = true;
    }

    select.appendChild(option);
  }
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