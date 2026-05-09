import { db } from "./firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


async function login() {

  const name = document.getElementById("name").value;

  const baptismName =
    document.getElementById("baptismName").value;


  if (name === "" || baptismName === "") {

    alert("이름과 세례명을 입력해주세요.");

    return;
  }


  // Firebase 저장
  try {

    await addDoc(collection(db, "participants"), {

      name: name,

      baptismName: baptismName,

      createdAt: new Date()

    });

    console.log("참가자 저장 완료");

  } catch (error) {

    console.error("저장 실패:", error);

  }


  localStorage.setItem("name", name);

  localStorage.setItem("baptismName", baptismName);


  window.location.href = "map.html";

}


// HTML 버튼에서 사용할 수 있게 등록
window.login = login;