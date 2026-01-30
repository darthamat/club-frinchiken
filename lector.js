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
  "La pipa de Bilbo",
  "Tiara de Donut",
  "eBook de Mithril",
  "Gafas de lectura Jhony N5",
  "Espada de Gandalf",
  "Armadura de páginas de la primera Biblia"
];

const LOGROS = [
  // 🧩 RETOS
  {
    id: "reto_enero",
    titulo: "Reto de Enero superado",
    descripcion: "Completaste el reto mensual",
    tipo: "reto",
    condicion: (l) => l.esReto === true
  },

  // 📚 PÁGINAS
  {
    id: "tocho_1000",
    titulo: "Lector/a de tochos",
    descripcion: "Leíste un libro de 1000 páginas o más",
    condicion: (l) => l.paginas >= 1000
  },

  // 📦 GÉNEROS
  {
    id: "romantico",
    titulo: "Corazón de tinta",
    descripcion: "Leíste un libro romántico",
    condicion: (l) => l.categoria?.toLowerCase().includes("romance")
  },
  {
    id: "erotico",
    titulo: "Lector/a cachondo/a 😏",
    descripcion: "Leíste literatura erótica",
    condicion: (l) => l.categoria?.toLowerCase().includes("erótico")
  },
   {
    id: "fantasia",
    titulo: "Amante de dragones",
    descripcion: "Leíste literatura fantástica",
    condicion: (l) => l.categoria?.toLowerCase().includes("fantasia")
  },
   {
    id: "terror",
    titulo: "Mal  rollito ",
    descripcion: "Leíste un libro de terror",
    condicion: (l) => l.categoria?.toLowerCase().includes("terror")
  },

  // 🌙 HÁBITOS
  {
    id: "nocturno",
    titulo: "Lector/a nocturno",
    descripcion: "Terminaste un libro entre las 00:00 y las 06:00",
    condicion: () => {
      const h = new Date().getHours();
      return h >= 0 && h < 6;
    }
  },
{
  id: "mes_10_libros",
  titulo: "Devorador/a de libros",
  condicion: () => {
    const ahora = new Date();
    const mes = ahora.getMonth();
    const año = ahora.getFullYear();

    const librosMes = lecturasCache.filter(l => {
      if (!l.fechaFin) return false;
      const f = l.fechaFin.toDate();
      return f.getMonth() === mes && f.getFullYear() === año;
    });

    return librosMes.length >= 10;
  }
},
{
  id: "mes_5_libros",
  titulo: "Super lector/a",
  condicion: () => {
    const ahora = new Date();
    const mes = ahora.getMonth();
    const año = ahora.getFullYear();

    const librosMes = lecturasCache.filter(l => {
      if (!l.fechaFin) return false;
      const f = l.fechaFin.toDate();
      return f.getMonth() === mes && f.getFullYear() === año;
    });

    return librosMes.length >= 5;
  }
},

{
  id: "anio_20_libros",
  titulo: "Devorador/a de libros",
  condicion: () => {
    const añoActual = new Date().getFullYear();

    const librosAnio = lecturasCache.filter(l => {
      if (!l.fechaFin) return false;
      const f = l.fechaFin.toDate();
      return f.getFullYear() === añoActual;
    });

    return librosAnio.length >= 20;
  }
},

{
  id: "anio_30_libros",
  titulo: "Devorador/a de bibliotecas",
  condicion: () => {
    const añoActual = new Date().getFullYear();

    const librosAnio = lecturasCache.filter(l => {
      if (!l.fechaFin) return false;
      const f = l.fechaFin.toDate();
      return f.getFullYear() === añoActual;
    });

    return librosAnio.length >= 30;
  }
}
  
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

  usuarioData = {
    experiencia: 0,
    experienciaNecesario: 100,
    prestigio: 0,
    monedas: 0,
    nivel: 1,
    ...snap.data()
  };

  nombrePersonajeEl.textContent = usuarioData.nombrePersonaje || "Sin nombre";
  claseEl.textContent = usuarioData.clase || "Aventurero";
  nivelEl.textContent = usuarioData.nivel;
  usuarioPrestigio.textContent = usuarioData.prestigio;
  usuarioMonedas.textContent = usuarioData.monedas;

  actualizarXP();
  pintarLogros();
}


function actualizarXP(mostrarAlert = false) {
  if (!usuarioData.experienciaNecesario || usuarioData.experienciaNecesario <= 0) {
    usuarioData.experienciaNecesario = xpNecesariaParaNivel(usuarioData.nivel);
  }

  while (usuarioData.experiencia >= usuarioData.experienciaNecesario) {
    usuarioData.experiencia -= usuarioData.experienciaNecesario;
    usuarioData.nivel++;
    usuarioData.experienciaNecesario = xpNecesariaParaNivel(usuarioData.nivel);

    if (mostrarAlert) {
      alert(`✨ ¡Has subido al nivel ${usuarioData.nivel}!`);
    }
  }

  nivelEl.textContent = usuarioData.nivel;
  xpBarraEl.style.width =
    `${(usuarioData.experiencia / usuarioData.experienciaNecesario) * 100}%`;
  xpTextoEl.textContent =
    `${usuarioData.experiencia} / ${usuarioData.experienciaNecesario} XP`;
}


// ---------------- RETO ----------------
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

  // Limpiar inputs
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "";
  portadaLibro.src = "https://via.placeholder.com/120x180";

  busquedaLibro.value = "";
  resultados.innerHTML = "";
  resultados.classList.add("hidden");
});

// ---------------- CARGAR LECTURAS ----------------
async function cargarLecturas() {
  const snap = await getDocs(
    query(collection(db, "users", usuarioActual.uid, "lecturas"))
  );

  lecturasCache = [];
  snap.forEach(d => lecturasCache.push({ id: d.id, ...d.data() }));

  // Añadir reto si no existe en Firestore
  const reto = await cargarReto();
  const retoEnFirestore = lecturasCache.find(l => l.esReto);

  if (reto && !retoEnFirestore) {
    const ref = await addDoc(
      collection(db, "users", usuarioActual.uid, "lecturas"),
      {
        titulo: reto.Titulo,
        autor: reto.Autor,
        categoria: reto.categoria,
        paginas: reto.Paginas,
        activa: true,
        progreso: 0,
        esReto: true,
        fechaInicio: new Date()
      }
    );
    lecturasCache.unshift({ id: ref.id, ...reto });
  }

  pintarLecturas();
}

// ---------------- TERMINAR LECTURA ----------------
async function terminarLectura(l) {
  if (!usuarioActual) return;

  const userRef = doc(db, "users", usuarioActual.uid);
  const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", l.id);

  // Marcar lectura como inactiva
  await updateDoc(lecturaRef, {
    activa: false,
    fechaFin: new Date()
  });

  l.activa = false;

  // RPG logic
  if (l.esReto) {
  usuarioData.experiencia += l.paginas;

  actualizarXP();

  await updateDoc(userRef, {
    experiencia: usuarioData.experiencia,
    nivel: usuarioData.nivel,
    experienciaNecesario: usuarioData.experienciaNecesario
  });

  alert(`🎉 ¡Reto completado! +${l.paginas} XP`);

//comprobarNivel();
    
  } else {
    await updateDoc(userRef, { prestigio: increment(l.paginas) });
    
    usuarioPrestigio.textContent = Number(usuarioPrestigio.textContent) + l.paginas;
    
    alert(`⭐ Lectura completada. Prestigio + ${l.paginas}`);
  }

  // Recompensas
  const recompensa = generarRecompensas(l.paginas);

  if (recompensa.monedas) {
    await updateDoc(userRef, { monedas: increment(recompensa.monedas) });
   
    usuarioMonedas.textContent =
    Number(usuarioMonedas.textContent) + recompensa.monedas;

usuarioData.monedas += recompensa.monedas;
  usuarioMonedas.textContent = usuarioData.monedas;
    
    alert(`💰 Has conseguido ${recompensa.monedas} marcapáginas!`);
  }

  if (recompensa.objeto) {
    alert(`🎁 Has encontrado un objeto mágico: ${recompensa.objeto}`);
  }

  pintarLecturas();
  await comprobarLogros(l);
  
  
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

    // Barra de progreso
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

    // Botones de progreso
    const cambiarProgreso = async (delta) => {
      l.progreso = Math.min(100, Math.max(0, (l.progreso || 0) + delta));
      if (l.id) {
        await updateDoc(
          doc(db, "users", usuarioActual.uid, "lecturas", l.id),
          { progreso: l.progreso }
        );
      }
      pintarLecturas();
    };

    ["-10%", "+10%"].forEach((txt, i) => {
      const b = document.createElement("button");
      b.textContent = txt;
      b.onclick = () => cambiarProgreso(i ? 10 : -10);
      li.appendChild(b);
    });

    // Botón Terminar
    const btnTerminar = document.createElement("button");
    btnTerminar.textContent = "📗 Terminar";
    btnTerminar.onclick = () => terminarLectura(l);
    li.appendChild(btnTerminar);

    // Botón Eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.onclick = async () => {
      if (!confirm("¿Eliminar lectura?")) return;
      if (l.id) await deleteDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id));
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

// ---------------- BÚSQUEDA LIBROS ----------------
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
      categoriaInput.value = info.categories ? info.categories.join(", ") : "Sin categoría";
      portadaLibro.src = info.imageLinks?.thumbnail || portadaLibro.src;
      resultados.classList.add("hidden");
    };

    resultados.appendChild(li);
  });
}

// ---------------- RECOMPENSAS ----------------
function generarRecompensas(paginas) {
  const monedas = Math.floor(Math.random() * (paginas * 1)) + 1;
  const rand = Math.random() * 100;
  let objeto = null;

  if (rand > 95) objeto = objetosLegendarios[Math.floor(Math.random() * objetosLegendarios.length)];
  else if (rand > 85) objeto = objetosRaros[Math.floor(Math.random() * objetosRaros.length)];

  return { monedas, objeto };
}
/*function comprobarNivel() {
  while (usuarioData.experiencia >= usuarioData.experienciaNecesario) {
    usuarioData.experiencia -= usuarioData.experienciaNecesario;
    usuarioData.nivel += 1;
    usuarioData.experienciaNecesario = xpNecesariaParaNivel(usuarioData.nivel);
    //usuarioData.experienciaNecesario = Math.floor(usuarioData.experienciaNecesario * 1.5);
  }

  nivelEl.textContent = usuarioData.nivel;
  actualizarXP();

  updateDoc(doc(db, "users", usuarioActual.uid), {
    nivel: usuarioData.nivel,
    experiencia: usuarioData.experiencia,
    experienciaNecesario: usuarioData.experienciaNecesario
  });
}*/

function xpNecesariaParaNivel(nivel) {
  if (nivel <= 5) return 400 + (nivel - 1) * 150;
  if (nivel <= 10) return 1300 + (nivel - 6) * 350;
  return 3600 + (nivel - 11) * 1000;
}

//logros

async function comprobarLogros(lectura) {
  const userRef = doc(db, "users", usuarioActual.uid);
  usuarioData.logros ??= {};

  for (const logro of LOGROS) {
    if (usuarioData.logros[logro.id]) continue;

    if (logro.condicion?.(lectura)) {
      usuarioData.logros[logro.id] = {
        fecha: new Date(),
        titulo: logro.titulo
      };

      await updateDoc(userRef, {
        [`logros.${logro.id}`]: {
          fecha: new Date(),
          titulo: logro.titulo
        }
      });

      mostrarNotificacionLogro(logro);
    }
  }
}

//pintar logros

function pintarLogros() {
  const cont = document.getElementById("feedLogros");
  cont.innerHTML = "";

  const logros = usuarioData.logros || {};

  if (Object.keys(logros).length === 0) {
    cont.textContent = "Aún no has desbloqueado logros";
    return;
  }

  Object.values(logros).forEach(l => {
    const div = document.createElement("div");
    div.className = "logro";
    div.innerHTML = `
      <strong>${l.titulo}</strong><br>
      <small>${new Date(l.fecha.seconds * 1000).toLocaleDateString()}</small>
    `;
    cont.appendChild(div);
  });
}
function mostrarNotificacionLogro(logro) {
  alert(`🏆 Logro desbloqueado: ${logro.titulo}`);
}
