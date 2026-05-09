// Firebase SDK 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBpBZawykoJmoxt6UH9QHXwDUWzq6UFqE",

  authDomain: "cydcyd-d6b4d.firebaseapp.com",

  projectId: "cydcyd-d6b4d",

  storageBucket: "cydcyd-d6b4d.firebasestorage.app",

  messagingSenderId: "754917647248",

  appId: "1:754917647248:web:51149d08f0d47f093d0915"
};


// Firebase 시작
const app = initializeApp(firebaseConfig);


// Firestore DB 연결
const db = getFirestore(app);


// 다른 파일에서도 사용할 수 있게 내보내기
export { db };