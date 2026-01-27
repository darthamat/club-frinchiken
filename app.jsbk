import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ---------------- CONFIG FIREBASE ----------------
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

// ---------------- ELEMENTOS DOM ----------------
const btnAcceder = document.getElementById("btnAcceder");
const btnLogout = document.getElementById("btnLogout");
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const registrarBtn = document.getElementById("registrarBtn");
const btnGoogle = document.getElementById("btnGoogle");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// ---------------- POPUP LOGIN ----------------
// Abrir modal
btnAcceder.addEventListener("click", () => loginModal.classList.remove("hidden"));

// Cerrar modal al hacer click fuera del contenido
loginModal.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.classList.add("hidden");
});

// ---------------- LOGIN / REGISTRO EMAIL ----------------
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginError.textContent = "";
    loginModal.classList.add("hidden");
  } catch (error) {
    loginError.textContent = error.message;
  }
});

registrarBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db,"users",cred.user.uid),{
      displayName: email,
      prestigio: 0,
      nivel: 1,
      photoURL: ""
    });
    loginError.textContent = "";
    loginModal.classList.add("hidden");
  } catch (error) {
    loginError.textContent = error.message;
  }
});

// ---------------- LOGIN GOOGLE ----------------
btnGoogle.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db,"users",user.uid);
    const snap = await getDoc(userRef);
    if(!snap.exists()){
      await setDoc(userRef,{ displayName:user.displayName, prestigio:0, nivel:1, photoURL:user.photoURL||"" });
    }
    loginModal.classList.add("hidden");
  } catch(e){
    alert(e.message);
  }
});

// ---------------- LOGOUT ----------------
btnLogout.addEventListener("click", async()=>await signOut(auth));

// ---------------- DETECTAR SESION ----------------
onAuthStateChanged(auth, async (user)=>{
  if(user){
    btnAcceder.classList.add("hidden");
    btnLogout.classList.remove("hidden");
  } else {
    btnAcceder.classList.remove("hidden");
    btnLogout.classList.add("hidden");
  }
});
const feedLogros = document.getElementById("feedLogros");

// Función para mostrar un logro con animación
function mostrarLogro(logro){
  const div = document.createElement("div");
  div.classList.add("logro-feed");

  // Clase y emoji según rareza
  let clase = "logro-normal emoji-normal";
  if(logro.botin.tipo === "raro") clase = "logro-raro emoji-raro";
  if(logro.botin.tipo === "legendario") clase = "logro-legendario emoji-legendario";
  div.classList.add(clase);

  div.textContent += `${logro.usuario} ha conseguido: ${logro.botin.item} (${logro.botin.tipo})`;

  feedLogros.appendChild(div);

  // Borrar después de animación (0.8s)
  setTimeout(()=>div.remove(), 1000);
}

// Cargar logros aleatorios de usuarios
async function cargarLogrosFeed(){
  const usersSnap = await getDocs(collection(db,"users"));
  let todosLogros = [];

  usersSnap.forEach(userDoc=>{
    const data = userDoc.data();
    const lecturas = data.lecturas || [];
    lecturas.forEach(l=>{
      if(l.botinGenerado && l.botin){
        todosLogros.push({
          usuario: data.displayName || "Anónimo",
          libro: l.titulo,
          botin: l.botin
        });
      }
    });
  });

  // Mezclar
  todosLogros.sort(()=>Math.random()-0.5);

  // Mostrar 1-2 logros aleatorios cada intervalo
  const n = Math.floor(Math.random()*2)+1;
  for(let i=0;i<n;i++){
    const l = todosLogros[i % todosLogros.length];
    mostrarLogro(l);
  }
}

// Actualizar cada 3 segundos
setInterval(cargarLogrosFeed, 3000);
cargarLogrosFeed();

// Función para cargar el reto actual
async function cargarRetoActual() {
  try {
    // Ajusta el ID del reto según tu Firestore
    const retoRef = doc(db, "retos", "2026_01");
    const snap = await getDoc(retoRef);

    if (snap.exists()) {
      const reto = snap.data();
      titulo.textContent = reto.Titulo || "Título desconocido";
      autor.textContent = "Autor: " + (reto.Autor || "Desconocido");
      portada.src = reto.portadaUrl || "";
    } else {
      tituloEl.textContent = "No hay reto activo";
      autorEl.textContent = "";
      portadaEl.src = "";
    }
  } catch (error) {
    console.error("Error cargando reto:", error);
    tituloEl.textContent = "Error al cargar el reto";
    autorEl.textContent = "";
    portadaEl.src = "";
  }
}

// Ejecutar al cargar la página
cargarRetoActual();
