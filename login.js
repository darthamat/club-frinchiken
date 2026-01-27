import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0",
  authDomain: "club-frinchiken.firebaseapp.com",
  projectId: "club-frinchiken",
  storageBucket: "club-frinchiken.firebasestorage.app",
  messagingSenderId: "993321884320",
  appId: "1:993321884320:web:d4da17ddcc78f0482787c5"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// ELEMENTOS
const loginBtn = document.getElementById("loginBtn");
const btnGoogle = document.getElementById("btnGoogle");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// LOGIN EMAIL
loginBtn.addEventListener("click", async ()=>{
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  loginError.textContent = "";
  try{
    await signInWithEmailAndPassword(auth,email,password);
    window.location.href = "dashboard.html"; // Redirige tras login
  }catch(e){
    loginError.textContent = e.message;
  }
});

// LOGIN GOOGLE
btnGoogle.addEventListener("click", async ()=>{
  try{
    const result = await signInWithPopup(auth,provider);
    const user = result.user;
    const userRef = doc(db,"users",user.uid);
    const snap = await getDoc(userRef);
    if(!snap.exists()){
      // Si es usuario nuevo, asigna clase aleatoria
      const clasesRPG = [
        "BiblioGuerrero","MagoEnciclopédico","ClérigoLiterario",
        "ExploradorNovelesco","PícaroEnsayista","BardoPoético","DruidaLecturasVerdes"
      ];
      const clase = clasesRPG[Math.floor(Math.random()*clasesRPG.length)];
      await setDoc(userRef,{
        displayName:user.displayName,
        prestigio:0,
        nivel:1,
        clase:clase,
        photoURL:user.photoURL||"",
        lecturas:[]
      });
    }
    window.location.href = "dashboard.html";
  }catch(e){
    loginError.textContent = e.message;
  }
});
