import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

// ---------------- ELEMENTOS DOM ----------------
const btnRegister = document.getElementById("btnRegister");
const nombreRealInput = document.getElementById("nombreReal");
const nombrePersonajeInput = document.getElementById("nombrePersonaje");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");

// ---------------- CLASES ALEATORIAS ----------------
const clasesPersonaje = [
"Mago/a Sabe-lo-Todo", "Bardo/a Cuentacuentos", "Caballero de las Palabras",
  "Pícaro/a de los Post-it", "Druida Romantasy", "Inventor/a de Tramas",
  "Explorador/a de Bibliotecas", "Alquimista de Historias", "Guardabibliotecas",
  "Adivinador/a de tramas", "Hechicero/a de Tochos Imposibles", "Viajero/a de Mundos Paralelos",
  "Señor/a de las Comillas", "Monje de los Ensayos",
  "Gladiador Poético", "Cazador de Spoilers", "Pirata de Libros Digitales",
  "Arquero/a de la Lectura", "Alquimista de Café y Libros", "Ladrón/a de libros"
];

// ---------------- REGISTRO ----------------
btnRegister.addEventListener("click", async () => {
  const nombreReal = nombreRealInput.value.trim();
  let nombrePersonaje = nombrePersonajeInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if(!nombreReal || !email || !password) {
    errorMsg.textContent = "Completa los campos obligatorios";
    return;
  }

  // Si no pone nombre de personaje, se asigna uno aleatorio
  if(!nombrePersonaje){
    nombrePersonaje = clasesPersonaje[Math.floor(Math.random()*clasesPersonaje.length)];
  }

  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);

    // Guardar datos en Firestore
    await setDoc(doc(db,"users",cred.user.uid),{
      nombreReal,
      nombrePersonaje,
      displayName: nombrePersonaje,
      prestigio: 0,
      nivel: 1,
      fuerza: 10,
      agilidad: 10,
      inteligencia: 10,
      sabiduria: 10,
      fatiga: 0,
      mente: 0,
      corazon: 0,
      imagen_avatar: "",
      clase: nombrePersonaje,
      experiencia: 0,
      experienciaNecesario: 0,

    });

    errorMsg.style.color = "green";
    errorMsg.textContent = "¡Registro completado! !Se ha asignado una clase aleatoria! Puedes iniciar sesión.";
    
    // Redirigir al login después de 2s
    setTimeout(()=>window.location.href="login.html",2000);
    
  } catch(e){
    errorMsg.style.color = "red";
    errorMsg.textContent = e.message;
  }
});

