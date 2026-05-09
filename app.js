const app = document.getElementById("app");

const missions = {
  mission1: false,
  mission2: false,
};

function completedCount() {
  return Object.values(missions).filter(Boolean).length;
}

function renderHome() {
  app.innerHTML = `
    <div class="page" style="padding:20px; text-align:center; font-family:sans-serif;">

      <h1 style="font-size:40px;">청소년대회</h1>
      <p style="font-size:20px;">QR 미션 투어</p>

      <div style="
        background:#f3f3f3;
        padding:20px;
        border-radius:20px;
        margin:20px auto;
        max-width:350px;
      ">
        <p>현재 진행 상황</p>

        <h2 style="font-size:40px;">
          ${completedCount()} / 2
        </h2>

        <div style="
          width:100%;
          height:20px;
          background:#ddd;
          border-radius:10px;
          overflow:hidden;
        ">
          <div style="
            width:${completedCount() * 50}%;
            height:100%;
            background:#4caf50;
          "></div>
        </div>
      </div>

      <p style="margin-top:30px;">
        QR코드를 스캔하여 미션을 수행하세요.
      </p>

      <button onclick="startQR()" style="
        padding:15px 30px;
        font-size:20px;
        border:none;
        border-radius:15px;
        background:#4caf50;
        color:white;
        margin-top:20px;
      ">
        QR 스캔하기
      </button>

      <br><br>

      <button onclick="showMap()" style="
        padding:12px 25px;
        font-size:18px;
        border:none;
        border-radius:15px;
        background:#2196f3;
        color:white;
      ">
        지도 보기
      </button>

      <br><br>

      <button onclick="resetGame()" style="
        padding:10px 20px;
        font-size:16px;
        border:none;
        border-radius:12px;
        background:#ff5252;
        color:white;
      ">
        처음부터 다시하기
      </button>

    </div>
  `;
}

window.startQR = function () {
  app.innerHTML = `
    <div style="padding:20px; text-align:center;">
      <h2>QR 스캔</h2>

      <div id="reader" style="
        width:300px;
        margin:20px auto;
      "></div>

      <button onclick="renderHome()" style="
        padding:10px 20px;
        border:none;
        border-radius:12px;
      ">
        돌아가기
      </button>
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
    }
  );
};

function handleQR(text) {

  if (text.includes("mission1")) {
    renderMission1();
    return;
  }

  if (text.includes("mission2")) {
    renderMission2();
    return;
  }

  alert("등록되지 않은 QR입니다.");
  renderHome();
}

function renderMission1() {

  app.innerHTML = `
    <div style="padding:20px; text-align:center;">

      <h2>미션 1</h2>

      <p>퍼즐 미션 성공!</p>

      <img src="./puzzle.png" style="
        width:300px;
        max-width:90%;
        border-radius:20px;
        margin-top:20px;
      ">

      <br><br>

      <button onclick="completeMission1()" style="
        padding:15px 30px;
        font-size:20px;
        border:none;
        border-radius:15px;
        background:#4caf50;
        color:white;
      ">
        완료하기
      </button>

    </div>
  `;
}

window.completeMission1 = function () {

  missions.mission1 = true;

  alert("미션 1 완료!");

  renderHome();
};

function renderMission2() {

  app.innerHTML = `
    <div style="padding:20px; text-align:center;">

      <h2>미션 2</h2>

      <p style="font-size:24px;">
        아무것도 ____하지 마십시오.
      </p>

      <input
        id="answer"
        placeholder="정답 입력"
        style="
          padding:15px;
          font-size:20px;
          border-radius:12px;
          border:1px solid #ccc;
          width:80%;
          max-width:300px;
          text-align:center;
        "
      >

      <br><br>

      <button onclick="checkMission2()" style="
        padding:15px 30px;
        font-size:20px;
        border:none;
        border-radius:15px;
        background:#4caf50;
        color:white;
      ">
        정답 확인
      </button>

    </div>
  `;
}

window.checkMission2 = function () {

  const answer = document
    .getElementById("answer")
    .value
    .trim();

  if (answer === "걱정") {

    missions.mission2 = true;

    alert("미션 2 완료!");

    renderHome();

  } else {

    alert("틀렸습니다!");
  }
};

window.showMap = function () {

  alert("여기에 지도 연결 예정");
};

window.resetGame = function () {

  if (confirm("처음부터 다시할까요?")) {

    missions.mission1 = false;
    missions.mission2 = false;

    renderHome();
  }
};

window.renderHome = renderHome;

renderHome();

alert("app.js 연결됨");

document.body.innerHTML = `
  <div style="padding:30px; text-align:center;">
    <h1>화면 테스트 성공</h1>
    <p>app.js가 정상 연결되었습니다.</p>
  </div>
`;