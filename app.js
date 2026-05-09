function login() {

  const name = document.getElementById("name").value;

  const baptismName =
    document.getElementById("baptismName").value;

  // 입력 확인
  if (name === "" || baptismName === "") {

    alert("이름과 세례명을 입력해주세요.");

    return;
  }

  // 저장
  localStorage.setItem("name", name);

  localStorage.setItem("baptismName", baptismName);

  // 환영 메시지
  alert(name + " " + baptismName + "님 환영합니다!");

window.location.href = "map.html";
}
