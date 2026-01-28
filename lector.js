// ---------------- IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs
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
const paginasInput = document.getElementById("paginas");
const categoriaInput = document.getElementById("categoria");
const portadaLibro = document.getElementById("portadaLibro");

const listaLecturasEl = document.getElementById("listaLecturas");
const btnToggleTerminadas = document.createElement("button");
btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
btnToggleTerminadas.style.marginTop = "10px";
listaLecturasEl.parentNode.insertBefore(btnToggleTerminadas, listaLecturasEl.nextSibling);

// ---------------- ESTADO ----------------
let usuarioActual = null;
let lecturasCache = [];
let mostrarTerminados = false;
let usuarioData = null;

// ---------------- SESIÓN ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href == "login.html";

  usuarioActual = user;
  await cargarPerfilUsuario();
  await cargarLecturas();
});

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

  actualizarXP(usuarioData.experiencia || 0, usuarioData.experienciaNecesario || 100);
}

function actualizarXP(xpActual, xpNecesario) {
  xpBarraEl.style.width = `${Math.min(100, (xpActual / xpNecesario) * 100)}%`;
  xpTextoEl.textContent = `${xpActual} / ${xpNecesario} XP`;
}

// ---------------- BOTÓN RETO ----------------
btnReto.addEventListener("click", async () => {
  const retoSnap = await getDoc(doc(db, "retos", "2026_01"));
  if (!retoSnap.exists()) return;

  const reto = retoSnap.data();
  tituloInput.value = reto.Titulo || "";
  autorInput.value = reto.Autor || "";
  paginasInput.value = reto.Paginas || "";
  categoriaInput.value = reto.categoria || "Fantasía";
  portadaLibro.src = reto.portadaUrl || "";
});

// ---------------- BUSCADOR LIBROS ----------------
busquedaLibro.addEventListener("input", async () => {
  const texto = busquedaLibro.value.trim();
  if (texto.length < 3) return;

  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=5`);
  const data = await res.json();
  if (!data.items) return;

  data.items.forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.textContent = `${info.title} — ${info.authors?.[0] || "Desconocido"}`;

    li.addEventListener("mouseover", () => li.style.background = "#eee");
    li.addEventListener("mouseout", () => li.style.background = "transparent");

    li.addEventListener("click", () => {
      tituloInput.value = info.title || "";
      autorInput.value = info.authors?.[0] || "";
      paginasInput.value = info.pageCount || 0;

      const categoria = info.categories?.[0] || "Fantasía";
      if (![...categoriaInput.options].some(o => o.value === categoria)) {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaInput.appendChild(opt);
      }
      categoriaInput.value = categoria;

      if (info.imageLinks?.thumbnail) portadaLibro.src = info.imageLinks.thumbnail;

      resultados.classList.add("hidden");
    });

    resultados.appendChild(li);
  });
});

// ---------------- REGISTRAR NUEVA LECTURA ----------------
btnRegistrar.addEventListener("click", async () => {
  if (!usuarioActual) return alert("Debes iniciar sesión");

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

  await addDoc(collection(db, "users", usuarioActual.uid, "lecturas"), lectura);
  lecturasCache.unshift(lectura);

  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "Fantasía";
  portadaLibro.src = "https://via.placeholder.com/120x180";

  pintarLecturas();
});

// ---------------- CARGAR LECTURAS ----------------
async function cargarLecturas() {
  const q = query(collection(db, "users", usuarioActual.uid, "lecturas"));
  const snap = await getDocs(q);

  lecturasCache = [];
  snap.forEach(docSnap => lecturasCache.push({ id: docSnap.id, ...docSnap.data() }));

  // Añadir reto automáticamente si no existe
  const retoSnap = await getDoc(doc(db, "retos", "2026_01"));
  if (retoSnap.exists() && !lecturasCache.some(l => l.esReto)) {
    const reto = retoSnap.data();
    lecturasCache.unshift({
      titulo: reto.Titulo,
      autor: reto.Autor,
      categoria: reto.categoria || "Fantasía",
      paginas: reto.Paginas || 0,
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

  const mostrar = mostrarTerminados ? lecturasCache : lecturasCache.filter(l => l.activa);

  mostrar.forEach((l, index) => {
    const li = document.createElement("li");
    li.style.marginBottom = "8px";
    li.textContent = `${l.titulo} — ${l.autor} (${l.categoria})`;

    // --- Barra de progreso ---
    const barraCont = document.createElement("div");
    barraCont.style.width = "150px";
    barraCont.style.height = "10px";
    barraCont.style.background = "#ddd";
    barraCont.style.display = "inline-block";
    barraCont.style.marginLeft = "10px";
    barraCont.style.verticalAlign = "middle";

    const barraFill = document.createElement("div");
    barraFill.style.width = `${l.progreso || 0}%`;
    barraFill.style.height = "100%";
    barraFill.style.background = l.esReto ? "#FFD700" : "#00aaff";
    barraCont.appendChild(barraFill);
    li.appendChild(barraCont);

    // --- Botones +10 / -10%
    const btnMenos = document.createElement("button");
    btnMenos.textContent = "-10%";
    btnMenos.style.marginLeft = "5px";
    btnMenos.addEventListener("click", async () => {
      l.progreso = Math.max(0, (l.progreso || 0) - 10);
      if (l.id) await updateDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id), { progreso: l.progreso });
      pintarLecturas();
    });

    const btnMas = document.createElement("button");
    btnMas.textContent = "+10%";
    btnMas.style.marginLeft = "5px";
    btnMas.addEventListener("click", async () => {
      l.progreso = Math.min(100, (l.progreso || 0) + 10);
      if (l.id) await updateDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id), { progreso: l.progreso });
      pintarLecturas();
    });

    li.appendChild(btnMenos);
    li.appendChild(btnMas);

    // --- Botón terminar ---
    const btnTerminar = document.createElement("button");
    btnTerminar.textContent = "📗 Terminar";
    btnTerminar.style.marginLeft = "5px";
    btnTerminar.addEventListener("click", async () => {
      if (l.id) await updateDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id), { activa: false, fechaFin: new Date() });

      // --- Recompensas ---
      if (l.esReto) {
        // XP por reto
        let xpNuevo = (usuarioData.experiencia || 0) + 50; // ejemplo 50 XP por reto
        let nivelActual = usuarioData.nivel || 1;
        let xpNecesario = usuarioData.experienciaNecesario || 100;

        while (xpNuevo >= xpNecesario) {
          xpNuevo -= xpNecesario;
          nivelActual += 1;
          xpNecesario = Math.floor(xpNecesario * 1.2);
        }

        await updateDoc(doc(db, "users", usuarioActual.uid), {
          experiencia: xpNuevo,
          experienciaNecesario: xpNecesario,
          nivel: nivelActual
        });

        usuarioData.experiencia = xpNuevo;
        usuarioData.nivel = nivelActual;
        usuarioData.experienciaNecesario = xpNecesario;
      } else {
        // Prestigio por libro normal
        let prestigioNuevo = (usuarioData.prestigio || 0) + 10;
        await updateDoc(doc(db, "users", usuarioActual.uid), { prestigio: prestigioNuevo });
        usuarioData.prestigio = prestigioNuevo;
      }

      cargarLecturas();
    });
    li.appendChild(btnTerminar);

    // --- Botón eliminar ---
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌ Eliminar";
    btnEliminar.style.marginLeft = "5px";
    btnEliminar.addEventListener("click", async () => {
      if (l.id && confirm("¿Eliminar esta lectura?")) {
        await deleteDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id));
        lecturasCache.splice(index, 1);
        pintarLecturas();
      }
    });
    li.appendChild(btnEliminar);

    // --- Estilo reto ---
    if (l.esReto) {
      li.style.fontWeight = "bold";
      li.style.color = "#FFD700";
      li.textContent += " [RETO]";
    }

    listaLecturasEl.appendChild(li);
  });
}

// ---------------- TOGGLE TERMINADAS ----------------
btnToggleTerminadas.addEventListener("click", () => {
  mostrarTerminados = !mostrarTerminados;
  btnToggleTerminadas.textContent = mostrarTerminados ? "Ocultar lecturas terminadas" : "Mostrar lecturas terminadas";
  pintarLecturas();
});


/*
// ---------------- IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, collection, addDoc, updateDoc, Timestamp, query, where, getDocs
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

// ---------------- DOM ----------------
const nombrePersonajeEl = document.getElementById("nombrePersonaje");
const claseEl = document.getElementById("clasePersonaje");
const nivelEl = document.getElementById("nivelUsuario");

const busquedaLibro = document.getElementById("busquedaLibro");
const resultados = document.getElementById("resultados");

const btnRegistrar = document.getElementById("btnRegistrar");
const btnReto = document.getElementById("btnReto");
const btnLogout = document.getElementById("btnLogout");

const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("paginas");
const categoriaInput = document.getElementById("categoria");
const portadaLibro = document.getElementById("portadaLibro");

const listaLecturasEl = document.getElementById("listaLecturas");
const btnMostrarTerminados = document.getElementById("btnMostrarTerminados"); // botón oculto

// ---------------- ESTADO ----------------
let usuarioActual = null;
let lecturasCache = []; // cache local de lecturas activas
let mostrarTerminados = false;

// ---------------- SESIÓN ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href == "login.html";

  usuarioActual = user;
  await cargarPerfilUsuario();
  await cargarLecturas();
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------------- PERFIL ----------------
async function cargarPerfilUsuario() {
  const snap = await getDoc(doc(db, "users", usuarioActual.uid));
  if (!snap.exists()) return;

  const u = snap.data();
  nombrePersonajeEl.textContent = u.nombrePersonaje || "Sin nombre";
  claseEl.textContent = u.clase || "Aventurero";
  nivelEl.textContent = u.nivel || 1;
}

// ---------------- BOTÓN RETO ----------------
btnReto.addEventListener("click", async () => {
  const snap = await getDoc(doc(db, "retos", "2026_01"));
  if (!snap.exists()) return;

  const reto = snap.data();
  tituloInput.value = reto.Titulo || "";
  autorInput.value = reto.Autor || "";
  paginasInput.value = reto.Paginas || "";
  categoriaInput.value = reto.categoria || "Fantasía";
  portadaLibro.src = reto.portadaUrl || "";
});

// ---------------- BUSCADOR LIBROS ----------------
busquedaLibro.addEventListener("input", async () => {
  const texto = busquedaLibro.value.trim();
  if (texto.length < 3) return;

  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=5`);
  const data = await res.json();
  if (!data.items) return;

  data.items.forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.textContent = `${info.title} — ${info.authors?.[0] || "Desconocido"}`;

    li.addEventListener("mouseover", () => li.style.background = "#eee");
    li.addEventListener("mouseout", () => li.style.background = "transparent");

    li.addEventListener("click", () => {
      tituloInput.value = info.title || "";
      autorInput.value = info.authors?.[0] || "";
      paginasInput.value = info.pageCount || 0;

      // Categoría dinámica
      const categoria = info.categories?.[0] || "Fantasía";
      if (![...categoriaInput.options].some(o => o.value === categoria)) {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaInput.appendChild(opt);
      }
      categoriaInput.value = categoria;

      // Portada
      if (info.imageLinks?.thumbnail) portadaLibro.src = info.imageLinks.thumbnail;

      resultados.classList.add("hidden");
    });

    resultados.appendChild(li);
  });
});

// ---------------- CARGAR LECTURAS ----------------
async function cargarLecturas() {
  // Lecturas activas
  const q = query(collection(db, "users", usuarioActual.uid, "lecturas"), where("activa", "==", true));
  const snap = await getDocs(q);
  lecturasCache = [];
  snap.forEach(docSnap => lecturasCache.push({ id: docSnap.id, ...docSnap.data() }));

  // Agregar reto actual solo si no existe
  const retoSnap = await getDoc(doc(db, "retos", "2026_01"));
  if (retoSnap.exists()) {
    const reto = retoSnap.data();
    const yaExiste = lecturasCache.some(l => l.esReto);
    if (!yaExiste) {
      lecturasCache.unshift({
        titulo: reto.Titulo,
        autor: reto.Autor,
        categoria: reto.categoria || "Fantasía",
        paginas: reto.Paginas || 0,
        activa: true,
        esReto: true,
        progreso: 0,
        fechaInicio: new Date()
      });
    }
  }

  pintarLecturas();
}

// ---------------- PINTAR LECTURAS ----------------
function pintarLecturas() {
  listaLecturasEl.innerHTML = "";
  const mostrar = mostrarTerminados ? [...lecturasCache, ...lecturasCacheTerminadas()] : lecturasCache;

  mostrar.forEach((l, index) => {
    const li = document.createElement("li");
    li.textContent = `${l.titulo} — ${l.autor} (${l.categoria})`;

    // Progreso
    const progInput = document.createElement("input");
    progInput.type = "number";
    progInput.value = l.progreso || 0;
    progInput.min = 0;
    progInput.max = 100;
    progInput.style.marginLeft = "10px";
    progInput.style.width = "50px";
    progInput.addEventListener("change", async () => {
      l.progreso = Number(progInput.value);
      if (l.id) await updateDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id), { progreso: l.progreso });
    });

    li.appendChild(progInput);

    // Terminar libro
    const btnTerminar = document.createElement("button");
    btnTerminar.textContent = "📗 Terminar";
    btnTerminar.style.marginLeft = "10px";
    btnTerminar.addEventListener("click", async () => {
      if (l.id) await updateDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id), { activa: false, fechaFin: new Date() });
      // si es reto se podría sumar prestigio o experiencia aquí
      cargarLecturas();
    });
    li.appendChild(btnTerminar);

    // Estilo reto
    if (l.esReto) {
      li.style.color = "#FFD700";
      li.style.fontWeight = "bold";
      li.textContent += " [RETO]";
    }

    listaLecturasEl.appendChild(li);
  });
}

// Lecturas terminadas (solo para botón oculto)
function lecturasCacheTerminadas() {
  return lecturasCache.filter(l => !l.activa);
}

// ---------------- REGISTRAR NUEVA LECTURA ----------------
btnRegistrar.addEventListener("click", async () => {
  if (!usuarioActual) return alert("Debes iniciar sesión");

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

  await addDoc(collection(db, "users", usuarioActual.uid, "lecturas"), lectura);

  // Limpiar formulario
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "Fantasía";
  portadaLibro.src = "https://via.placeholder.com/120x180";

  lecturasCache.unshift(lectura); // cache local
  pintarLecturas();
});


/*import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, collection, addDoc, Timestamp, query, where, getDocs, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


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

// ---------------- DOM ----------------
const nombrePersonajeEl = document.getElementById("nombrePersonaje");
const claseEl = document.getElementById("clasePersonaje");
const nivelEl = document.getElementById("nivelUsuario");

const busquedaLibro = document.getElementById("busquedaLibro");
const resultados = document.getElementById("resultados");
const btnBuscar = document.getElementById("btnBuscar");

const btnRegistrar = document.getElementById("btnRegistrar");
const btnReto = document.getElementById("btnReto");

const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("Paginas");
const categoriaInput = document.getElementById("categoria");

/*const tituloLibro = document.getElementById("titulo");
const autorLibro = document.getElementById("autor");
const paginasLibro = document.getElementById("paginas");
const categoriaLibro = document.getElementById("categoria");
const portadaLibro = document.getElementById("portadaLibro"); // este id no estaba en tu HTML
*/
/*
const listaLecturasEl = document.getElementById("listaLecturas");


let usuarioActual = null;

// ---------------- SESIÓN ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioActual = user;
  await cargarPerfilUsuario();
  await cargarLecturas();
});

const btnLogout = document.getElementById("btnLogout");

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------------- PERFIL ----------------
async function cargarPerfilUsuario() {
  const ref = doc(db, "users", usuarioActual.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const u = snap.data();
  nombrePersonajeEl.textContent = u.nombrePersonaje || "Sin nombre";
  claseEl.textContent = u.clase || "Aventurero";
  nivelEl.textContent = u.nivel || 1;
}


//boton reto
btnReto.addEventListener("click", async () => {
  const retoRef = doc(db, "retos", "2026_01");
  const snap = await getDoc(retoRef);

  if (!snap.exists()) return;

  const reto = snap.data();
  tituloInput.value = reto.Titulo || "";
  autorInput.value = reto.Autor || "";
  paginasInput.value = reto.Paginas || "";
  categoriaInput.value = reto.categoria || "Fantasía";
});


// ---------------- BUSCADOR LIBROS ----------------
busquedaLibro.addEventListener("input", async () => {
  const texto = busquedaLibro.value.trim();
  if (texto.length < 3) return;

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

    li.addEventListener("click", () => {
      tituloInput.value = info.title || "";
      autorInput.value = info.authors?.[0] || "";
      paginasInput.value = info.pageCount || 0;

      // Categoría dinámica
      const categoria = info.categories?.[0] || "Fantasía";

      if (![...categoriaInput.options].some(o => o.value === categoria)) {
        const opt = document.createElement("option");
        opt.value = categoria;
        opt.textContent = categoria;
        categoriaInput.appendChild(opt);
      }
      categoriaInput.value = categoria;

      // Portada
      if (info.imageLinks?.thumbnail && portadaLibro) {
        portadaLibro.src = info.imageLinks.thumbnail;
      }

      resultados.classList.add("hidden");
    });

    resultados.appendChild(li);
  });
});


// ---------------- REGISTRAR NUEVA LECTURA ----------------
btnRegistrar.addEventListener("click", async () => {
  if (!usuarioActual) return alert("Debes iniciar sesión");

  const lectura = {
    titulo: tituloInput.value.trim(),
    autor: autorInput.value.trim(),
    paginas: Number(paginasInput.value),
    categoria: categoriaInput.value,
    activa: true,
    esReto: false,
    fechaInicio: new Date()
  };

  if (!lectura.titulo || !lectura.autor) {
    return alert("Faltan datos");
  }

  /*await addDoc(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    lectura
  );*/
/*
  // limpiar formulario
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "Fantasía";

  // 🔥 refrescar lista
  cargarLecturas();
  lecturasCache.push(nuevaLectura);
pintarLecturas(lecturasCache);
});


//lecturas activas

async function cargarLecturas() {
  listaLecturasEl.innerHTML = "";

  const q = query(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    where("activa", "==", true)
  );
  const snap = await getDocs(q);

  const lecturas = [];
  snap.forEach(d => lecturas.push({ id: d.id, ...d.data() }));

  // 🔹 reto
  const retoSnap = await getDoc(doc(db, "retos", "2026_01"));
  if (retoSnap.exists()) {
    const reto = retoSnap.data();
    const yaExiste = lecturas.some(l => l.esReto && l.retoId === "2026_01");


    if (!yaExiste) {
      await addDoc(
        collection(db, "users", usuarioActual.uid, "lecturas"),
        {
          titulo: reto.Titulo,
          autor: reto.Autor,
          categoria: reto.categoria || "Fantasía",
          activa: true,
          esReto: true,
          fechaInicio: new Date()
        }
      );
      return cargarLecturas(); // 🔁 recarga limpia
    }
  }

  lecturas.forEach(l => {
    const li = document.createElement("li");
    li.textContent = `${l.titulo} — ${l.autor}`;

    if (l.esReto) {
      li.style.color = "#FFD700";
      li.style.fontWeight = "bold";
      li.textContent += " [RETO]";
    }

    listaLecturasEl.appendChild(li);
  });
}
*/
