import { getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD0JJiM2Nz_s6ImxR7u4-9k6CnGmdgiQVk",
  authDomain: "pcrs-ef65e.firebaseapp.com",
  projectId: "pcrs-ef65e",
  storageBucket: "pcrs-ef65e.firebasestorage.app",
  messagingSenderId: "556301982192",
  appId: "1:556301982192:web:c3b170d198c23f83392535",
  measurementId: "G-9ENGWLM7HW",
  databaseURL: "https://pcrs-ef65e-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
