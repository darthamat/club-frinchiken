import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const btnLoginPage = document.getElementById("btnLoginPage");
const btnRegisterPage = document.getElementById("btnRegisterPage");
const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const portada = document.getElementById("portada");
const feedLogros = document.getElementById("feedLogros");

// ---------------- BOTONES HEADER ----------------
btnLoginPage.addEventListener("click", () => {
  window.location.href = "login.html"; // Página de login con Google / Email
});

btnRegisterPage.addEventListener("click", () => {
  window.location.href = "register.html"; // Página de registro de cuenta
});



// ---------------- CARGAR RETO ACTUAL ----------------
async function cargarRetoActual(){
  try{
    const retoRef = doc(db,"retos","reto-actual");
    const snap = await getDoc(retoRef);
    if(snap.exists()){
      const reto = snap.data();
      titulo.textContent = reto.titulo || "Título desconocido";
      autor.textContent = "Autor: " + (reto.autor || "Desconocido");
      portada.src = reto.portadaUrl || "";
    } else {
      titulo.textContent = "No hay reto activo";
      autor.textContent = "";
      portada.src = "";
    }
  }catch(e){
    console.error(e);
    titulo.textContent = "Error al cargar el reto";
    autor.textContent = "";
    portada.src = "";
  }
}
cargarRetoActual();


async function cargarLogrosComunidad() {
  const snap = await getDocs(collection(db, "users"));
  let todosLogros = [];

  snap.forEach(userDoc => {
    const user = userDoc.data();
    if (!user.logros) return;
    for (const [id, logro] of Object.entries(user.logros)) {
      let rareza = "comun";
      if (id.includes("reto") || id.includes("tocho")) rareza = "legendario";
      else if (id.includes("erotico") || id.includes("nocturno")) rareza = "raro";

      todosLogros.push({
        usuario: user.nombrePersonaje || "Desconocido",
        titulo: logro.titulo,
        fecha: logro.fecha,
        rareza
      });
    }
  });

  return todosLogros;
}

async function mostrarLogrosVisuales() {
  const logros = await cargarLogrosComunidad();
  if (!logros.length) return;

  const ticker = document.getElementById("logro-dinamico");
  ticker.innerHTML = "";

  // Selecciona 10 logros aleatorios para el ticker
  const seleccionados = [];
  while (seleccionados.length < 10 && logros.length > 0) {
    const index = Math.floor(Math.random() * logros.length);
    seleccionados.push(logros.splice(index, 1)[0]);
  }

  seleccionados.forEach(l => {
    const div = document.createElement("div");
    div.className = `ticker-item ${l.rareza}`;

    // Icono según rareza
    let icon = "⭐"; // por defecto
    if (l.rareza === "legendario") icon = "💎";
    else if (l.rareza === "raro") icon = "✨";

    div.innerHTML = `
      <span class="icon">${icon}</span>
      <strong>${l.usuario}</strong>: ${l.titulo}
    `;

    ticker.appendChild(div);
  });
}

// Actualiza el ticker cada 15 segundos
document.addEventListener("DOMContentLoaded", () => {
  mostrarLogrosVisuales();
  setInterval(mostrarLogrosVisuales, 15000);
});


/*async function mostrarLogrosVisuales() {
  const logros = await cargarLogrosComunidad();
  if (!logros.length) return;

  const ticker = document.getElementById("tickerComunidad");
  if (!ticker) return; // previene errores si el div no existe
  ticker.innerHTML = "";

  const seleccionados = [];
  while (seleccionados.length < 10 && logros.length > 0) {
    const index = Math.floor(Math.random() * logros.length);
    seleccionados.push(logros.splice(index, 1)[0]);
  }

  seleccionados.forEach(l => {
    const div = document.createElement("div");
    div.className = `ticker-item ${l.rareza}`;

    let icon = "⭐";
    if (l.rareza === "legendario") icon = "💎";
    else if (l.rareza === "raro") icon = "✨";

    div.innerHTML = `<span class="icon">${icon}</span> <strong>${l.usuario}</strong>: ${l.titulo}`;
    ticker.appendChild(div);
  });
}*/

/*8document.addEventListener("DOMContentLoaded", () => {
  mostrarLogrosVisuales();
  setInterval(mostrarLogrosVisuales, 15000);
});*/



let logros = [];
let indice = 0;

function iniciarCicloLogros(lista) {
  logros = lista; // logros de comunidad
  if (!logros || logros.length === 0) return;

  mostrarLogro();
  setInterval(() => {
    indice = (indice + 1) % logros.length;
    mostrarLogro();
  }, 5000);
}


function siguienteLogro() {
  indice = (indice + 1) % logros.length;
  mostrarLogro();
}

function mostrarLogro() {
  const cont = document.getElementById("logro-dinamico");
  if (!cont || logros.length === 0) return;

  const l = logros[indice];

  // Solo mostrar icono + nombre del logro, opcional: ocultar usuario
  cont.innerHTML = `
    <div class="logro">
      <span class="icono">${l.icono || "🏆"}</span>
      <strong>${l.nombre}</strong>
      <small>${tiempoRelativo(l.fecha)}</small>
    </div>
  `;
}

function tiempoRelativo(fecha) {
  const diff = Date.now() - fecha.toMillis();
  const min = Math.floor(diff / 60000);

  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;

  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;

  return "ayer";
}


async function cargarHallOfFame() {
  const rankingDiv = document.getElementById("ranking");
  rankingDiv.innerHTML = "Cargando ranking...";

  const q = query(
    collection(db, "users"),
    orderBy("prestigio", "desc"),
    orderBy("nivel", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);
  rankingDiv.innerHTML = "";

  let posicion = 1;

  snap.forEach(doc => {
    const u = doc.data();

    const div = document.createElement("div");
    div.className = `jugador top${posicion}`;

    div.innerHTML = `
      <div>
        <div class="nombre">${posicion}. ${u.nombrePersonaje || "Sin nombre"}</div>
        <div class="stats">Nivel ${u.nivel} · Prestigio ${u.prestigio}</div>
      </div>
    `;

    rankingDiv.appendChild(div);
    posicion++;
  });
}
cargarHallOfFame();
