// ---------------- IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  enableIndexedDbPersistence,
  increment 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ---------------- FIREBASE ----------------
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

// 🔥 CACHÉ LOCAL FIRESTORE
enableIndexedDbPersistence(db).catch(() => {
  console.warn("Persistencia local no disponible");
});

// ---------------- DOM ----------------
const nombrePersonajeEl = document.getElementById("nombrePersonaje");
const claseEl = document.getElementById("clasePersonaje");
const nivelEl = document.getElementById("nivelUsuario");
const xpBarraEl = document.getElementById("barraXP");
const xpTextoEl = document.getElementById("xpUsuario");

const busquedaLibro = document.getElementById("busquedaLibro");
const resultados = document.getElementById("resultados");

const btnRegistrar = document.getElementById("btnRegistrar");
const btnReto = document.getElementById("btnReto");
const btnLogout = document.getElementById("btnLogout");

const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("Paginas");
const categoriaInput = document.getElementById("categoria");
const portadaLibro = document.getElementById("portadaLibro");

const listaLecturasEl = document.getElementById("listaLecturas");
const btnToggleTerminadas = document.createElement("button");
btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
listaLecturasEl.parentNode.insertBefore(btnToggleTerminadas, listaLecturasEl.nextSibling);
const btnBuscar = document.getElementById("btnBuscar");

const usuarioXP = document.getElementById("xpUsuario");
const usuarioPrestigio = document.getElementById("usuarioPrestigio");
const usuarioMonedas = document.getElementById("usuarioMonedas");

const userRef = doc(db, "users", usuarioActual.uid);

const objetosRaros = [
  "Marcapáginas de dragón",
  "Lupa de detective",
  "Pluma encantada",
  "Taza de café mágico",
  "Capa de invisibilidad de biblioteca"
];

const objetosLegendarios = [
  "El Anillo Único",
  "Un huevo de dragon de Daenerys",
  "La dragonlance",
  "La segunda bola de dragon",
  "Sombrero de Terry Pratchett",
  "Tercer libro de El nombre del Viento",
  "La granada de Antioquia",
  "Chapines de rubies",
  "La pipa de Bilbo";
  "Tiara de Donut",
  "eBook de Mithril",
  "Gafas de lectura Jhony N5",
  "Espada de Gandalf",
  "Armadura de páginas de la primera Biblia"
];

// ---------------- ESTADO ----------------
let usuarioActual = null;
let usuarioData = null;
let lecturasCache = [];
let retoCache = null;
let mostrarTerminados = false;

// ---------------- SESIÓN ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href == "login.html";

  usuarioActual = user;
  await cargarPerfilUsuario();
  await cargarLecturas(); // ⬅️ UNA SOLA VEZ
});

// ---------------- LOGOUT ----------------
btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------------- PERFIL ----------------
async function cargarPerfilUsuario() {
  const snap = await getDoc(doc(db, "users", usuarioActual.uid));
  if (!snap.exists()) return;

  usuarioData = snap.data();

  nombrePersonajeEl.textContent = usuarioData.nombrePersonaje || "Sin nombre";
  claseEl.textContent = usuarioData.clase || "Aventurero";
  nivelEl.textContent = usuarioData.nivel || 1;

  actualizarXP(
    usuarioData.experiencia || 0,
    usuarioData.experienciaNecesario || 100
  );
}

function actualizarXP(actual, necesario) {
  xpBarraEl.style.width = `${Math.min(100, (actual / necesario) * 100)}%`;
  xpTextoEl.textContent = `${actual} / ${necesario} XP`;
}

// ---------------- RETO (CACHEADO) ----------------
async function cargarReto() {
  if (retoCache) return retoCache;

  const snap = await getDoc(doc(db, "retos", "2026_01"));
  if (!snap.exists()) return null;

  retoCache = snap.data();
  return retoCache;
}

btnReto.addEventListener("click", async () => {
  const reto = await cargarReto();
  if (!reto) return;

  tituloInput.value = reto.Titulo || "";
  autorInput.value = reto.Autor || "";
  paginasInput.value = reto.Paginas || "";
  categoriaInput.value = reto.categoria || "";
  portadaLibro.src = reto.portadaUrl || "";
});

// ---------------- REGISTRAR LECTURA ----------------
btnRegistrar.addEventListener("click", async () => {
  if (!usuarioActual) return;

  let categoriaSeleccionada = "";

  const lectura = {
    titulo: tituloInput.value.trim(),
    autor: autorInput.value.trim(),
    paginas: Number(paginasInput.value),
    categoria: categoriaInput.value,
    activa: true,
    progreso: 0,
    esReto: false,
    fechaInicio: new Date()
  };

  if (!lectura.titulo || !lectura.autor) return alert("Faltan datos");

  const ref = await addDoc(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    lectura
  );

  lecturasCache.unshift({ id: ref.id, ...lectura });
  pintarLecturas();

  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  
 categoriaInput.value = "";
  
  portadaLibro.src = "https://via.placeholder.com/120x180";

  //limpieza buscador
 busquedaLibro.value = "";
  resultados.innerHTML = "";          // <-- CLAVE
  resultados.classList.add("hidden"); // <-- OCULTAR
});

// ---------------- CARGAR LECTURAS (UNA VEZ) ----------------
async function cargarLecturas() {
  const snap = await getDocs(
    query(collection(db, "users", usuarioActual.uid, "lecturas"))
  );

  lecturasCache = [];
  snap.forEach(d => lecturasCache.push({ id: d.id, ...d.data() }));

  // Añadir reto si no existe
  const reto = await cargarReto();
  if (reto && !lecturasCache.some(l => l.esReto)) {
    lecturasCache.unshift({
      titulo: reto.Titulo,
      autor: reto.Autor,
      categoria: reto.categoria,
      paginas: reto.Paginas,
      activa: true,
      progreso: 0,
      esReto: true,
      fechaInicio: new Date()
    });
  }

  pintarLecturas();
}

// ---------------- PINTAR LECTURAS ----------------
function pintarLecturas() {
  listaLecturasEl.innerHTML = "";

  const lista = mostrarTerminados
    ? lecturasCache
    : lecturasCache.filter(l => l.activa);

  lista.forEach((l, index) => {
    const li = document.createElement("li");
    li.textContent = `${l.titulo} — ${l.autor}`;

    // Barra progreso
    const barra = document.createElement("div");
    barra.style.width = "150px";
    barra.style.height = "10px";
    barra.style.background = "#ddd";
    barra.style.display = "inline-block";
    barra.style.marginLeft = "10px";

    const fill = document.createElement("div");
    fill.style.width = `${l.progreso || 0}%`;
    fill.style.height = "100%";
    fill.style.background = l.esReto ? "#FFD700" : "#00aaff";
    barra.appendChild(fill);
    li.appendChild(barra);

    // +10 / -10
    const cambiarProgreso = async (delta) => {
      l.progreso = Math.min(100, Math.max(0, (l.progreso || 0) + delta));
      pintarLecturas();
      if (l.id) {
        await updateDoc(
          doc(db, "users", usuarioActual.uid, "lecturas", l.id),
          { progreso: l.progreso }
        );
      }
    };

    ["-10%", "+10%"].forEach((txt, i) => {
      const b = document.createElement("button");
      b.textContent = txt;
      b.onclick = () => cambiarProgreso(i ? 10 : -10);
      li.appendChild(b);
    });

    // Terminar
    const btnTerminar = document.createElement("button");
    btnTerminar.textContent = "📗 Terminar";
  btnTerminar.onclick = async () => {
  // 1️⃣ MARCAR LECTURA COMO INACTIVA (TU LÓGICA EXISTENTE)
  l.activa = false;
  pintarLecturas();

  if (l.id) {
    await updateDoc(
      doc(db, "users", usuarioActual.uid, "lecturas", l.id),
      { activa: false, fechaFin: new Date() }
    );
  }

  // 2️⃣ LÓGICA RPG NUEVA 🔥
  const userRef = doc(db, "users", usuarioActual.uid);

  if (l.esReto) {
    // XP = 1 por página
    await updateDoc(userRef, {
      xp: increment(l.paginas)
    });

    // Actualizar panel visual
    usuarioXP.textContent =
      Number(usuarioXP.textContent) + l.paginas;

    alert(`🎉 ¡Reto completado! +${l.paginas} XP`);
  } else {
    // Lectura libre → Prestigio +1
    await updateDoc(userRef, {
      prestigio: increment(1)
    });

    // Actualizar panel visual
    usuarioPrestigio.textContent =
      Number(usuarioPrestigio.textContent) + 1;

    alert(`⭐ Lectura completada. Prestigio +1`);
  }
};

li.appendChild(btnTerminar);

    // Eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.onclick = async () => {
      if (!confirm("¿Eliminar lectura?")) return;
      if (l.id) await deleteDoc(
        doc(db, "users", usuarioActual.uid, "lecturas", l.id)
      );
      lecturasCache.splice(index, 1);
      pintarLecturas();
    };
    li.appendChild(btnEliminar);

    listaLecturasEl.appendChild(li);
  });
}





// ---------------- TOGGLE TERMINADAS ----------------
btnToggleTerminadas.addEventListener("click", () => {
  mostrarTerminados = !mostrarTerminados;
  btnToggleTerminadas.textContent = mostrarTerminados
    ? "Ocultar lecturas terminadas"
    : "Mostrar lecturas terminadas";
  pintarLecturas();
});

let timeoutBusqueda = null;

btnBuscar.addEventListener("click", () => {
  const texto = busquedaLibro.value.trim();

  if (texto.length < 3) {
    resultados.classList.add("hidden");
    return;
  }

  buscarLibros(texto);
});

async function buscarLibros(texto) {
  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=5`
  );

  const data = await res.json();
  if (!data.items) return;

  data.items.forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");

    li.textContent = `${info.title} — ${info.authors?.[0] || "Desconocido"}`;

    li.onclick = () => {
      tituloInput.value = info.title || "";
      autorInput.value = info.authors?.[0] || "";
      paginasInput.value = info.pageCount || 0;
     
     const categoriaSeleccionada = info.categories
  ? info.categories.join(", ")
  : "Sin categoría";

      categoriaInput.value = categoriaSeleccionada;

     
      portadaLibro.src = info.imageLinks?.thumbnail || portadaLibro.src;
      
      resultados.classList.add("hidden");
   
    };

    resultados.appendChild(li);
  });
}
async function terminarLectura(lectura) {
  if (!usuarioActual) return;

  
  const lecturaRef = doc(
    db,
    "users",
    usuarioActual.uid,
    "lecturas",
    lectura.id
  );

  // 🎮 RPG logic
  if (lectura.esReto) {
    // XP = 1 por página
    await updateDoc(userRef, {
      xp: increment(lectura.paginas)
    });

    usuarioXP.textContent =
      Number(usuarioXP.textContent) + lectura.paginas;

  } else {
    // Prestigio por lectura libre
    await updateDoc(userRef, {
      prestigio: increment(1)
    });

    usuarioPrestigio.textContent =
      Number(usuarioPrestigio.textContent) + 1;
  }

  // 📦 mover a histórico
  await updateDoc(lecturaRef, {
    activa: false,
    fechaFin: new Date()
  });

  // 🖼️ UI
  ocultarLecturaDelPanel(lectura.id);

  // 1️⃣ Desactivar lectura
  l.activa = false;
  pintarLecturas();

  if (l.id) {
    await updateDoc(
      doc(db, "users", usuarioActual.uid, "lecturas", l.id),
      { activa: false, fechaFin: new Date() }
    );
  }

  

  // 2️⃣ RPG clásico: XP y Prestigio
  if (l.esReto) {
    await updateDoc(userRef, { xp: increment(l.paginas) });
    usuarioXP.textContent =
      Number(usuarioXP.textContent) + l.paginas;
  } else {
    await updateDoc(userRef, { prestigio: increment(1) });
    usuarioPrestigio.textContent =
      Number(usuarioPrestigio.textContent) + 1;
  }

  // 3️⃣ Recompensas
  const recompensa = generarRecompensas(l.paginas);

  // Guardar monedas en Firestore
  if (recompensa.monedas) {
    await updateDoc(userRef, { monedas: increment(recompensa.monedas) });
    // Actualizar panel visual
    usuarioMonedas.textContent =
      Number(usuarioMonedas.textContent) + recompensa.monedas;
  }

  // Mostrar objeto mágico si lo hay
  if (recompensa.objeto) {
    alert(`🎁 Has encontrado un objeto mágico: ${recompensa.objeto}`);
  }

  // 4️⃣ Feedback visual (opcional)
  if (recompensa.monedas) alert(`💰 Has ganado ${recompensa.monedas} monedas!`);
}
function generarRecompensas(paginas) {
  // Monedas aleatorias
  const monedas = Math.floor(Math.random() * (paginas * 10)) + 1;

  // Objeto aleatorio
  const rand = Math.random() * 100; // 0-100
  let objeto = null;

  if (rand > 95) { // 5%
    objeto = objetosLegendarios[Math.floor(Math.random() * objetosLegendarios.length)];
  } else if (rand > 85) { // 10%
    objeto = objetosRaros[Math.floor(Math.random() * objetosRaros.length)];
  }
  // 80% → objeto = null, solo monedas

  return { monedas, objeto };
}
