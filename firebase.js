import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpBZawykoJmoxt6UH9QHXwDUWzq6UFqE",
  authDomain: "cydcyd-d6b4d.firebaseapp.com",
  projectId: "cydcyd-d6b4d",
  storageBucket: "cydcyd-d6b4d.firebasestorage.app",
  messagingSenderId: "754917647248",
  appId: "1:754917647248:web:51149d08f0d47f093d0915"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };