const app = document.getElementById("app");

let userName = localStorage.getItem("userName") || "";
let userSaintName = localStorage.getItem("userSaintName") || "";

let progress = JSON.parse(localStorage.getItem("progress")) || {
  mission1: false,
  mission2: false,
};

function saveProgress() {
  localStorage.setItem("progress", JSON.stringify(progress));
}

function completedCount() {
  return Object.values(progress).filter(Boolean).length;
}

function renderLogin() {
  app.innerHTML = `
    <div style="padding:30px; text-align:center; font-family:sans-serif;">
      <h1>청소년대회</h1>
      <p>이름과 세례명을 입력하세요.</p>

      <input id="nameInput" placeholder="이름 입력" style="
        padding:15px;
        font-size:20px;
        border-radius:12px;
        border:1px solid #ccc;
        text-align:center;
        width:80%;
        max-width:300px;
        margin-bottom:15px;
      ">

      <br>

      <input id="saintInput" placeholder="세례명 입력" style="
        padding:15px;
        font-size:20px;
        border-radius:12px;
        border:1px solid #ccc;
        text-align:center;
        width:80%;
        max-width:300px;
      ">

      <br><br>

      <button onclick="login()" style="
        padding:15px 30px;
        font-size:20px;
        border:none;
        border-radius:15px;
        background:#4caf50;
        color:white;
      ">
        시작하기
      </button>
    </div>
  `;
}

window.login = function () {
  const name = document.getElementById("nameInput").value.trim();
  const saint = document.getElementById("saintInput").value.trim();

  if (!name || !saint) {
    alert("이름과 세례명을 입력해주세요.");
    return;
  }

  userName = name;
  userSaintName = saint;

  localStorage.setItem("userName", userName);
  localStorage.setItem("userSaintName", userSaintName);

  renderHome();
};

function renderHome() {
  app.innerHTML = `
    <div style="padding:25px; text-align:center; font-family:sans-serif;">
      <h1>청소년대회</h1>
      <p>${userName} ${userSaintName}님 환영합니다</p>

      <div style="
        background:#f2f2f2;
        padding:20px;
        border-radius:20px;
        margin:20px auto;
        max-width:350px;
      ">
        <p>현재 진행 상황</p>
        <h2 style="font-size:40px;">${completedCount()} / 2</h2>

        <div style="
          width:100%;
          height:18px;
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

      <p>QR코드를 스캔하여 미션을 수행하세요.</p>

      <button onclick="startQR()" style="
        padding:15px 30px;
        font-size:20px;
        border:none;
        border-radius:15px;
        background:#4caf50;
        color:white;
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
    <div style="padding:20px; text-align:center; font-family:sans-serif;">
      <h2>QR 스캔</h2>
      <p>카메라 권한을 허용해주세요.</p>

      <div id="reader" style="width:300px; margin:20px auto;"></div>

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
    async function (decodedText) {
      await html5QrCode.stop();
      handleQR(decodedText);
    }
  ).catch(function () {
    alert("카메라를 사용할 수 없습니다.");
    renderHome();
  });
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
  if (progress.mission1) {
    alert("이미 완료한 미션입니다.");
    renderHome();
    return;
  }

  app.innerHTML = `
    <div style="padding:20px; text-align:center; font-family:sans-serif;">
      <h2>미션 1</h2>
      <p>퍼즐 미션입니다.</p>

      <img src="./puzzle.png" style="
        width:300px;
        max-width:90%;
        border-radius:20px;
        margin:20px auto;
        display:block;
      ">

      <button onclick="completeMission1()" style="
        padding:15px 30px;
        font-size:20px;
        border:none;
        border-radius:15px;
        background:#4caf50;
        color:white;
      ">
        미션 완료
      </button>

      <br><br>

      <button onclick="renderHome()">돌아가기</button>
    </div>
  `;
}

window.completeMission1 = function () {
  progress.mission1 = true;
  saveProgress();

  app.innerHTML = `
    <div style="padding:30px; text-align:center; font-family:sans-serif;">
      <h1>미션 완료!</h1>
      <p>미션 1을 완료했습니다.</p>

      <button onclick="renderHome()" style="
        padding:15px 30px;
        font-size:20px;
        border:none;
        border-radius:15px;
        background:#4caf50;
        color:white;
      ">
        확인
      </button>
    </div>
  `;
};

function renderMission2() {
  if (progress.mission2) {
    alert("이미 완료한 미션입니다.");
    renderHome();
    return;
  }

  app.innerHTML = `
    <div style="padding:20px; text-align:center; font-family:sans-serif;">
      <h2>미션 2</h2>
      <p style="font-size:24px;">아무것도 ____하지 마십시오.</p>

      <input id="answer" placeholder="정답 입력" style="
        padding:15px;
        font-size:20px;
        border-radius:12px;
        border:1px solid #ccc;
        width:80%;
        max-width:300px;
        text-align:center;
      ">

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

      <br><br>

      <button onclick="renderHome()">돌아가기</button>
    </div>
  `;
}

window.checkMission2 = function () {
  const answer = document.getElementById("answer").value.trim();

  if (answer === "걱정") {
    progress.mission2 = true;
    saveProgress();

    app.innerHTML = `
      <div style="padding:30px; text-align:center; font-family:sans-serif;">
        <h1>미션 완료!</h1>
        <p>정답입니다.</p>

        <button onclick="renderHome()" style="
          padding:15px 30px;
          font-size:20px;
          border:none;
          border-radius:15px;
          background:#4caf50;
          color:white;
        ">
          확인
        </button>
      </div>
    `;
  } else {
    alert("다시 생각해보세요!");
  }
};

window.showMap = function () {
  alert("지도는 나중에 연결하면 됩니다.");
};

window.resetGame = function () {
  if (!confirm("정말 처음부터 다시 시작할까요?")) return;

  localStorage.removeItem("userName");
  localStorage.removeItem("userSaintName");
  localStorage.removeItem("progress");

  userName = "";
  userSaintName = "";

  progress = {
    mission1: false,
    mission2: false,
  };

  renderLogin();
};

window.renderHome = renderHome;

if (userName && userSaintName) {
  renderHome();
} else {
  renderLogin();
}