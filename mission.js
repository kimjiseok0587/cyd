const missions = {
  1: {
    title: "1번 스팟 미션",
    text: "성당의 주보성인은 누구일까요?",
    answer: "성모마리아"
  },
  2: {
    title: "2번 스팟 미션",
    text: "예수님의 제자는 몇 명일까요?",
    answer: "12"
  },
  3: {
    title: "3번 스팟 미션",
    text: "감사의 마음을 담아 '아멘'을 입력하세요.",
    answer: "아멘"
  }
};

const urlParams = new URLSearchParams(window.location.search);
const spotId = urlParams.get("spot");

const mission = missions[spotId];

document.getElementById("missionTitle").innerText = mission.title;
document.getElementById("missionText").innerText = mission.text;

function checkAnswer() {
  const answer = document.getElementById("answer").value.trim();

  if (answer === mission.answer) {
    alert("정답입니다! 도장을 획득했습니다.");

    let completedSpots =
      JSON.parse(localStorage.getItem("completedSpots")) || [];

    if (!completedSpots.includes(spotId)) {
      completedSpots.push(spotId);
    }

    localStorage.setItem("completedSpots", JSON.stringify(completedSpots));

    window.location.href = "map.html";
  } else {
    alert("정답이 아닙니다. 다시 시도해보세요.");
  }
}

function goBack() {
  window.location.href = "map.html";
}