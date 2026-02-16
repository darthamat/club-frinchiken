
// ---------------- IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  where,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  enableIndexedDbPersistence,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  RECOMPENSAS,
  OBJETOS_RAROS,
  OBJETOS_LEGENDARIOS,
  LOGROS
} from "./gameConfig.js";

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
const paginasInput = document.getElementById("paginas");
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

const btnAsignarAdmin = document.getElementById("btn-asignar-admin");
const btnNuevoReto = document.getElementById("btn-nuevo-reto");
const selectAdmin = document.getElementById("selectAdmin");

//const fechaFin = l.fechaFin ?? new Date();

let modoCrearReto = false;

let lecturaPendiente = null;
let valoracionActual = 0;

let usuarioActual = {
  uid: null,       // se llenará al cargar el usuario
  role: null,
  tipoAdmin: null
};


// Lista de usuarios (ejemplo, en tu proyecto la traes de Firestore)
let usuarios = [];

// ---------------- ESTADO ----------------
//let usuarioActual = null;
let usuarioData = null;
let lecturasCache = [];
let retoCache = null;
let mostrarTerminados = false;


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 🔑 ESTA LÍNEA ES LA CLAVE
  usuarioActual.uid = user.uid;

  const snap = await getDoc(doc(db, "users", user.uid));
  const userData = snap.data();

  const avatarImg = document.getElementById("avatarImg");

if (userData.imagen_avatar && userData.imagen_avatar !== "") {
  avatarImg.src = userData.imagen_avatar;
}

  await cargarPerfilUsuario();
  await cargarLecturas();
  pintarLogros();
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

  const data = snap.data();

  usuarioData = {
    experiencia: data.experiencia ?? 0,
    nivel: data.nivel ?? 1,
    experienciaNecesaria:
      data.experienciaNecesaria ?? xpNecesariaParaNivel(data.nivel ?? 1),
    prestigio: data.prestigio ?? 0,
    monedas: data.monedas ?? 0,
    logros: data.logros ?? {},
    nombrePersonaje: data.nombrePersonaje,
    clase: data.clase
  };

usuarioActual.role = data.role ?? "user";
usuarioActual.tipoAdmin = data.tipoAdmin ?? null;

actualizarBotonesAdmin();


  nombrePersonajeEl.textContent = usuarioData.nombrePersonaje || "Sin nombre";
  claseEl.textContent = usuarioData.clase || "Aventurero";
  nivelEl.textContent = usuarioData.nivel;
  usuarioPrestigio.textContent = usuarioData.prestigio;
  usuarioMonedas.textContent = usuarioData.monedas;

  actualizarXP(false); // ⛔ sin alert al cargar

  //pintarLogros();
}

function actualizarBotonesAdmin() {
  if (!btnAsignarAdmin || !btnNuevoReto) return;

  console.log("ROL:", usuarioActual.role);
  console.log("TIPO ADMIN:", usuarioActual.tipoAdmin);

  btnAsignarAdmin.style.display =
    usuarioActual.role === "admin" ? "inline-block" : "none";

  btnNuevoReto.style.display =
    (usuarioActual.role === "admin" || usuarioActual.tipoAdmin === "crear")
      ? "inline-block"
      : "none";
}

async function mostrarSelectAdmin() {
  selectAdmin.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(docSnap => {
    if (docSnap.id !== usuarioActual.uid) {
      const u = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id;


      const nombreReal = u.nombreReal ?? "Sin nombre";
const personaje = u.nombrePersonaje ?? "Sin personaje";

option.textContent = `${nombreReal} (${personaje})`;



     // option.textContent = `${u.nombreReal} (${u.nombrePersonaje})`;
      selectAdmin.appendChild(option);
    }
  });

  selectAdmin.style.display = "inline-block";
}

//btnAsignarAdmin.addEventListener("click", mostrarSelectAdmin);

btnAsignarAdmin.addEventListener("click", async () => {
  if (usuarioActual.role !== "admin") return;

  console.log("Mostrando selector de admin");

  selectAdmin.innerHTML = "";
  selectAdmin.style.display = "inline-block";

  // ✅ Traer usuarios
  const snapshot = await getDocs(collection(db, "users"));

   await cargarUsuarios();

snapshot.forEach(docSnap => {
  const data = docSnap.data();
  if (docSnap.id === usuarioActual.uid) return; // omitirte a ti
  const option = document.createElement("option");
  option.value = docSnap.id;
  const nombreReal = data.nombreReal ?? "Sin nombre";
  const personaje = data.nombrePersonaje ?? "Sin personaje";
  option.textContent = `${nombreReal} (${personaje})`;
  selectAdmin.appendChild(option);
});

  if (selectAdmin.children.length === 0) {
    alert("⚠️ No hay usuarios disponibles para asignar");
  }
});

//selectAdmin.addEventListener("change", asignarAdmin);

selectAdmin.addEventListener("change", async () => {
  const uidNuevoAdmin = selectAdmin.value;
  if (!uidNuevoAdmin) return;

  // 1️⃣ Quitar admin temporal anterior
  const q = query(
    collection(db, "users"),
    where("tipoAdmin", "==", "crear")
  );

  const snap = await getDocs(q);
  for (const d of snap.docs) {
    await updateDoc(d.ref, { tipoAdmin: null });
  }

  // 2️⃣ Asignar nuevo admin temporal
  await updateDoc(doc(db, "users", uidNuevoAdmin), {
    tipoAdmin: "crear"
  });

  alert("👑 El poder ha sido transferido");

  selectAdmin.style.display = "none";
});

btnNuevoReto.addEventListener("click", activarModoCrearReto);

function activarModoCrearReto() {
  modoCrearReto = true;

  const panel = document.querySelector(".registro-lectura");

  panel.scrollIntoView({ behavior: "smooth", block: "center" });

  panel.classList.add("modo-reto");

  mostrarMensajeReto("📖 Selecciona el libro para el nuevo reto");
}

function mostrarMensajeReto(texto) {
  const msg = document.getElementById("mensajeReto");
  msg.textContent = texto;
  msg.classList.remove("hidden");
}

async function crearRetoConLibro(libro) {
  const retoData = {
    titulo: libro.titulo,
    autor: libro.autor,
    categoria: libro.categoria ?? "",
    portadaUrl: libro.portadaUrl,
    paginas: libro.paginas ?? 0,
    creadoPor: usuarioActual.uid,
    fecha: new Date()
  };

  // 1️⃣ Guardar reto "actual"
  await setDoc(doc(db, "retos", "reto-actual"), retoData);

  // 2️⃣ Crear documento histórico
  // Obtenemos el año y mes para generar algo tipo "actual2601", "actual2602", ...
  const ahora = new Date();
  const idHistorico = await generarIdRetoHistorico();

  await setDoc(doc(db, "retos", idHistorico), retoData);

  modoCrearReto = false;

  // Mensaje de éxito
  document.querySelector(".registro-lectura").classList.remove("modo-reto");
  document.getElementById("mensajeReto").textContent = "✅ Nuevo reto creado";

  setTimeout(() => {
    document.getElementById("mensajeReto").classList.add("hidden");
  }, 2000);
}

// Función para generar un ID histórico secuencial
async function generarIdRetoHistorico() {
  // Buscamos todos los documentos de retos cuyo ID empieza con "actual"
  const snap = await getDocs(collection(db, "retos"));
  let maxNumero = 0;

  snap.forEach(docSnap => {
    const id = docSnap.id;
    const match = id.match(/^actual(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNumero) maxNumero = num;
    }
  });

  // Siguiente número
  const nuevoNumero = maxNumero + 1;
  return `actual${nuevoNumero}`;
}

// ------------------ SELECCIONAR LIBRO ------------------
function seleccionarLibro(libro) {
  // Rellenar el formulario con los datos del libro
  rellenarFormularioLectura(libro);

  if (modoCrearReto) {
    // Cambiar botón de registrar a "Registrar nuevo reto"
    btnRegistrar.textContent = "Registrar nuevo reto";

    // Cuando se haga click, crear el reto en Firestore
    btnRegistrar.onclick = async () => {
      await crearRetoConLibro(libro);

      // Volver el botón a su estado normal
      btnRegistrar.textContent = "Registrar lectura";
      btnRegistrar.onclick = registrarLecturaNormal; // función original de registrar lectura
    };
  } else {
    // Si no estamos creando un reto, aseguramos que el botón funcione normalmente
    btnRegistrar.textContent = "Registrar lectura";
    btnRegistrar.onclick = registrarLecturaNormal;
  }
}

// ------------------ RELLENAR FORMULARIO ------------------
function rellenarFormularioLectura(libro) {
  tituloInput.value = libro.titulo || "";
  autorInput.value = libro.autor || "";
  paginasInput.value = libro.paginas || 0;
  portadaLibro.src = libro.portadaUrl || "https://via.placeholder.com/120x180";

  // Categoría solo si existe
  categoriaInput.value = libro.categoria || "";

}

// ------------------ FUNCIÓN ORIGINAL REGISTRAR LECTURA ------------------
async function registrarLecturaNormal() {
  if (!usuarioActual) return;

  const lectura = {
    titulo: tituloInput.value.trim(),
    autor: autorInput.value.trim(),
    paginas: Number(paginasInput.value) || 0,
    categoria: categoriaInput?.value ?? "",
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

  //lecturasCache.unshift({ id: ref.id, ...lectura });
  //pintarLecturas();
  await cargarLecturas();

  // Limpiar inputs
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "";
  portadaLibro.src = "https://via.placeholder.com/120x180";

  busquedaLibro.value = "";
  resultados.innerHTML = "";
  resultados.classList.add("hidden");
}

function actualizarXP(mostrarAlert = false) {
  if (!usuarioData.experienciaNecesaria || usuarioData.experienciaNecesaria <= 0) {
    usuarioData.experienciaNecesaria = xpNecesariaParaNivel(usuarioData.nivel);
  }

  while (usuarioData.experiencia >= usuarioData.experienciaNecesaria) {
    usuarioData.experiencia -= usuarioData.experienciaNecesaria;
    usuarioData.nivel++;
    usuarioData.experienciaNecesaria = xpNecesariaParaNivel(usuarioData.nivel);

    if (mostrarAlert) {
      alert(`✨ ¡Has subido al nivel ${usuarioData.nivel}!`);
    }
  }

  nivelEl.textContent = usuarioData.nivel;
  xpBarraEl.style.width =
    `${(usuarioData.experiencia / usuarioData.experienciaNecesaria) * 100}%`;
  xpTextoEl.textContent =
    `${usuarioData.experiencia} / ${usuarioData.experienciaNecesaria} XP`;
}


// ---------------- RETO ----------------
async function cargarReto() {
  if (retoCache) return retoCache;

  const snap = await getDoc(doc(db, "retos", "reto-actual"));
  if (!snap.exists()) return null;

  retoCache = snap.data();
  return retoCache;
}

btnReto.addEventListener("click", async () => {
  const reto = await cargarReto();
  if (!reto) return;

  tituloInput.value = reto.titulo || "";
  autorInput.value = reto.autor || "";
  paginasInput.value = reto.paginas || "";
  categoriaInput.value = reto.categoria || "";
  portadaLibro.src = reto.portadaUrl || "";
});

// ---------------- REGISTRAR LECTURA ----------------
//btnRegistrar.addEventListener("click", async () => {
//  if (!tituloInput.value || !autorInput.value) return alert("Faltan datos");
//
//  if (modoCrearReto) {
//    // Crear reto en Firestore
//    await setDoc(doc(db, "retos", "reto-actual"), {
//      titulo: tituloInput.value,
//      autor: autorInput.value,
//      paginas: Number(paginasInput.value),
//      categoria: categoriaInput.value || "",
//      portadaUrl: portadaLibro.src,
//      creadoPor: usuarioActual.uid,
//      fecha: new Date()
//    });
//
//    alert("📚 Nuevo reto creado con éxito!");
//
//    modoCrearReto = false;
//    btnRegistrar.textContent = "Registrar lectura";
//    mostrarMensajeReto("Selecciona un libro para registrar una lectura");
//
//    // Limpiar campos si quieres
//    tituloInput.value = "";
//    autorInput.value = "";
//    paginasInput.value = "";
//    categoriaInput.value = "";
//    portadaLibro.src = "https://via.placeholder.com/120x180";
//
//    resultados.innerHTML = "";
//    resultados.classList.add("hidden");
//  } else {
//    // Código normal de registrar lectura
//    const lectura = {
//      titulo: tituloInput.value.trim(),
//      autor: autorInput.value.trim(),
//      paginas: Number(paginasInput.value) || 0,
//      categoria: categoriaInput?.value ?? "",
//      activa: true,
//      progreso: 0,
//      esReto: false,
//      fechaInicio: new Date()
//    };
//
//    const ref = await addDoc(
//      collection(db, "users", usuarioActual.uid, "lecturas"),
//      lectura
//    );
//
//    //lecturasCache.unshift({ id: ref.id, ...lectura });
//    //pintarLecturas();
//    await cargarLecturas();
//
//    // Limpiar inputs
//    tituloInput.value = "";
//    autorInput.value = "";
//    paginasInput.value = "";
//    categoriaInput.value = "";
//    portadaLibro.src = "https://via.placeholder.com/120x180";
//
//    resultados.innerHTML = "";
//    resultados.classList.add("hidden");
//  }
//});


  // Cambiar texto del botón
  btnRegistrar.textContent = "Registrar nuevo reto";

  // Limpiar campos
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "";
  portadaLibro.src = "https://via.placeholder.com/120x180";

  // Mostrar mensaje
  mostrarMensajeReto("📖 Selecciona el libro para el nuevo reto");

  // Hacer scroll al panel
  document.querySelector(".registro-lectura").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

btnRegistrar.onclick = manejarRegistro;

async function manejarRegistro() {
  if (!tituloInput.value || !autorInput.value) {
    alert("Faltan datos");
    return;
  }

  if (modoCrearReto) {
    await crearRetoDesdeFormulario();
  } else {
    await registrarLecturaNormal();
  }
}

//async function registrarLecturaNormal() {
//  const lectura = {
//    titulo: tituloInput.value.trim(),
//    autor: autorInput.value.trim(),
//    paginas: Number(paginasInput.value) || 0,
//    categoria: categoriaInput?.value ?? "",
//    activa: true,
//    progreso: 0,
//    esReto: false,
//    fechaInicio: new Date()
//  };
//
//  await addDoc(
//    collection(db, "users", usuarioActual.uid, "lecturas"),
//    lectura
//  );
//
//  await cargarLecturas();
//  limpiarFormulario();
//}


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
        titulo: reto.titulo,
        autor: reto.autor,
        categoria: reto.categoria,
        paginas: reto.paginas,
        activa: true,
        progreso: 0,
        esReto: true,
        fechaInicio: new Date()
      }
    );
    lecturasCache.unshift({
  id: ref.id,
  titulo: reto.titulo,
  autor: reto.autor,
  categoria: reto.categoria,
  paginas: reto.paginas,
  activa: true,
  progreso: 0,
  esReto: true,
  fechaInicio: new Date()
});
  }

  pintarLecturas();
  await comprobarLogrosGlobales();
pintarLogros();

}

async function comprobarLogrosGlobales() {
  for (const l of lecturasCache) {
    await comprobarLogros(l);
  }
}

// ---------------- TERMINAR LECTURA ----------------
async function terminarLectura(l) {
  if (!l.activa) return;

  lecturaPendiente = l;
  valoracionActual = 0;

  document.getElementById("comentarioLectura").value = "";

  crearEstrellas();
  actualizarEstrellas();

  document
    .getElementById("modalValoracion")
    .classList.remove("hidden");
}

document.getElementById("btnCancelarValoracion").onclick = () => {
  lecturaPendiente = null;
  document
    .getElementById("modalValoracion")
    .classList.add("hidden");
};

document.getElementById("btnConfirmarValoracion").onclick = async () => {
  if (!lecturaPendiente) return;

  const comentario =
    document.getElementById("comentarioLectura").value.trim();

  document
    .getElementById("modalValoracion")
    .classList.add("hidden");

  await finalizarLecturaConRecompensas(
    lecturaPendiente,
    valoracionActual,
    comentario
  );

  lecturaPendiente = null;
};

async function finalizarLecturaConRecompensas(
  l,
  valoracion,
  comentario
) {
  const userRef = doc(db, "users", usuarioActual.uid);
  const lecturaRef = doc(
    db,
    "users",
    usuarioActual.uid,
    "lecturas",
    l.id
  );

  // Guardar valoración
  await updateDoc(lecturaRef, {
    activa: false,
    fechaFin: serverTimestamp(),
    valoracion,
    comentario
  });

  l.activa = false;

  // 🎮 RPG
  if (l.esReto) {
    usuarioData.experiencia += l.paginas;

    actualizarXP(true);

    await updateDoc(userRef, {
      experiencia: usuarioData.experiencia,
      nivel: usuarioData.nivel,
      experienciaNecesaria: usuarioData.experienciaNecesaria
    });

    alert(`🏆 Reto completado +${l.paginas} XP`);
  } else {
    await updateDoc(userRef, {
      prestigio: increment(l.paginas)
    });

    usuarioPrestigio.textContent =
      Number(usuarioPrestigio.textContent) + l.paginas;

    alert(`📚 Lectura completada +${l.paginas} prestigio`);
  }

  // 💰 Recompensas
  const recompensa = generarRecompensas(l.paginas);

  if (recompensa.monedas) {
    usuarioData.monedas += recompensa.monedas;

    await updateDoc(userRef, {
      monedas: increment(recompensa.monedas)
    });

    usuarioMonedas.textContent = usuarioData.monedas;

    alert(`💰 +${recompensa.monedas} marcapáginas`);
  }

  if (recompensa.objeto) {
    alert(`🎁 Objeto mágico: ${recompensa.objeto}`);
  }



  pintarLecturas();
  await comprobarLogros(l);
}

function renderizarEstrellas(valoracion) {
  if (!valoracion || valoracion <= 0) {
    return `<span class="sin-valoracion">Sin valorar</span>`;
  }

  let html = `<div class="estrellas-card">`;
  const estrellasCompletas = Math.floor(valoracion);
  const media = valoracion % 1 >= 0.5;

  for (let i = 0; i < estrellasCompletas; i++) {
    html += `<span class="estrella activa">★</span>`;
  }

  if (media) {
    html += `<span class="estrella media">★</span>`;
  }

  const restantes = 5 - estrellasCompletas - (media ? 1 : 0);
  for (let i = 0; i < restantes; i++) {
    html += `<span class="estrella">★</span>`;
  }

  html += `</div>`;
  return html;
}




//
//
//
//async function terminarLectura(l) {
//  if (!l.activa) return;
//  if (!usuarioActual) return;
//
//  const userRef = doc(db, "users", usuarioActual.uid);
//  const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", l.id);
//
//  // Marcar lectura como inactiva
//  await updateDoc(lecturaRef, {
//    activa: false,
//    fechaFin: new Date()
//  });
//
//  l.activa = false;
//
//  // RPG logic
//  if (l.esReto) {
//  usuarioData.experiencia += l.paginas;
//
//  actualizarXP();
//
//  await updateDoc(userRef, {
//    experiencia: usuarioData.experiencia,
//    nivel: usuarioData.nivel,
//    experienciaNecesaria: usuarioData.experienciaNecesaria
//  });
//
//  alert(`🎉 ¡Reto completado! +${l.paginas} XP`);
//
//
//
//  } else {
//    await updateDoc(userRef, { prestigio: increment(l.paginas) });
//
//    usuarioPrestigio.textContent = Number(usuarioPrestigio.textContent) + l.paginas;
//
//    alert(`⭐ Lectura completada. Prestigio + ${l.paginas}`);
//  }
//
//
//  const recompensa = generarRecompensas(l.paginas);
//
//if (recompensa.monedas) {
//  usuarioData.monedas += recompensa.monedas;
//  await updateDoc(userRef, { monedas: increment(recompensa.monedas) });
//
//  usuarioMonedas.textContent = usuarioData.monedas;
//  alert(`💰 Has conseguido ${recompensa.monedas} marcapáginas!`);
//}
//
//  if (recompensa.objeto) {
//    alert(`🎁 Has encontrado un objeto mágico: ${recompensa.objeto}`);
//  }
//
//  await updateDoc(docRef, {
//  activa: false,
//  fechaFin: serverTimestamp()
//});
//
//  pintarLecturas();
//  await comprobarLogros(l);
//
//
//}

async function cambiarProgreso(lectura, delta) {
  if (!lectura || !lectura.id) return;

  // Nuevo progreso
  let nuevoProgreso = (lectura.progreso || 0) + delta;
  nuevoProgreso = Math.max(0, Math.min(100, nuevoProgreso));

  // Guardar en Firestore
  const lecturaRef = doc(
    db,
    "users",
    usuarioActual.uid,
    "lecturas",
    lectura.id
  );

  await updateDoc(lecturaRef, {
    progreso: nuevoProgreso
  });

  // Actualizar en memoria
  lectura.progreso = nuevoProgreso;

  pintarLecturas();

  // 🎯 Si llega al 100%, terminar lectura automáticamente
  if (nuevoProgreso === 100 && lectura.activa) {
    setTimeout(() => terminarLectura(lectura), 300);
  }
}


// ---------------- PINTAR LECTURAS ----------------
//
function pintarLecturas() {
  listaLecturasEl.innerHTML = "";

  // Filtrar lecturas según el toggle de terminadas
  const lista = mostrarTerminados
    ? lecturasCache
    : lecturasCache.filter(l => l.activa);

  // Ordenar primero retos activos, luego lecturas normales
  const retos = lista.filter(l => l.esReto);
  const normales = lista.filter(l => !l.esReto);

  const listaOrdenada = [...retos, ...normales];

  listaOrdenada.forEach((l) => {
    const card = document.createElement("div");
    card.className = "lectura-card";

    // Borde dorado para retos
    if (l.esReto) card.classList.add("reto-card");

    // Nombre dinámico para retos
let tituloVisible = l.titulo;

if (l.esReto) {
  let fechaReto;
  if (l.fechaInicio) {
    // Manejar Firestore Timestamp o string
    fechaReto = l.fechaInicio.toDate ? l.fechaInicio.toDate() : new Date(l.fechaInicio);
  } else {
    fechaReto = new Date();
  }

  const mes = fechaReto.toLocaleString("es-ES", { month: "long" }).toUpperCase();
  const anio = fechaReto.getFullYear();

  // Aquí construimos el título visible
  tituloVisible = `🏆 RETO ${mes} ${anio}`;
}

card.innerHTML = `
  <div class="lectura-info">
    <strong title="${l.titulo}">${tituloVisible}</strong><br>
    <small>${l.titulo|| ""}</small><br>
    <small>${l.autor || ""}</small>

    ${renderizarEstrellas(l.valoracion)}

    ${l.fechaFin ? `<small>📅 ${formatearFecha(l.fechaFin)}</small>` : ""}
  </div>

  <div class="lectura-progreso">
    <div class="barra">
      <div class="fill" style="width:${l.progreso || 0}%"></div>
    </div>
    <span>${l.progreso || 0}%</span>
  </div>

  <div class="lectura-acciones">
    <button class="btn-progreso" data-delta="-10">-10%</button>
    <button class="btn-progreso" data-delta="10">+10%</button>
    <button class="btn-terminar">
      ${l.esReto ? "🏆 Terminar reto" : "📗 Terminar libro"}
    </button>
    <button class="btn-eliminar">❌</button>
  </div>
`;

    // Eventos de progreso
    card.querySelectorAll(".btn-progreso").forEach(btn => {
      btn.disabled = !l.activa;
      btn.onclick = () => cambiarProgreso(l, Number(btn.dataset.delta));
    });

    // Botón terminar lectura/reto
    card.querySelector(".btn-terminar").onclick = () => terminarLectura(l);

    // Botón eliminar lectura/reto
    card.querySelector(".btn-eliminar").onclick = async () => {
      const texto = l.esReto
        ? "⚠️ ¿Eliminar este reto?"
        : "⚠️ ¿Eliminar esta lectura?";
      if (!confirm(texto)) return;

      if (l.id) {
        await deleteDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id));
      }

      // Eliminar de memoria y repintar
      lecturasCache = lecturasCache.filter(x => x.id !== l.id);
      pintarLecturas();
    };

    listaLecturasEl.appendChild(card);
  });
}



//function pintarLecturas() {
//  listaLecturasEl.innerHTML = "";
//
//  const lista = mostrarTerminados
//    ? lecturasCache
//    : lecturasCache.filter(l => l.activa);
//
//  lista.forEach((l) => {
//    const card = document.createElement("div");
//    card.className = "lectura-card";
//
//    if (l.esReto) {
//      card.classList.add("reto-card");
//    }
//
//    card.innerHTML = `
//  <div class="lectura-info">
//    <strong>${l.titulo}</strong><br>
//    <small>${l.autor}</small>
//
//    ${renderizarEstrellas(l.valoracion)}
//
//    ${l.fechaFin ? `<small>📅 ${formatearFecha(l.fechaFin)}</small>` : ""}
//  </div>
//
//  <div class="lectura-progreso">
//    <div class="barra">
//      <div class="fill" style="width:${l.progreso || 0}%"></div>
//    </div>
//    <span>${l.progreso || 0}%</span>
//  </div>
//
//  <div class="lectura-acciones">
//    <button class="btn-progreso" data-delta="-10">-10%</button>
//    <button class="btn-progreso" data-delta="10">+10%</button>
//
//    <button class="btn-terminar">
//      ${l.esReto ? "🏆 Terminar reto" : "📗 Terminar libro"}
//    </button>
//
//    <button class="btn-eliminar">❌</button>
//  </div>
//`;
//
//    // Eventos
//    card.querySelectorAll(".btn-progreso").forEach(btn => {
//      btn.onclick = () => cambiarProgreso(l, Number(btn.dataset.delta));
//    });
//
//    card.querySelectorAll(".btn-progreso").forEach(btn => {
//  btn.disabled = !l.activa;
//  btn.onclick = () => cambiarProgreso(l, Number(btn.dataset.delta));
//});
//
//    card.querySelector(".btn-terminar").onclick = () => terminarLectura(l);
//
//    listaLecturasEl.appendChild(card);
//
//    card.querySelector(".btn-eliminar").onclick = async () => {
//  const texto = l.esReto
//    ? "⚠️ ¿Eliminar el reto actual?"
//    : "⚠️ ¿Eliminar esta lectura?";
//
//  if (!confirm(texto)) return;
//
//  if (l.id) {
//    await deleteDoc(
//      doc(db, "users", usuarioActual.uid, "lecturas", l.id)
//    );
//  }

  // Eliminar de memoria
  lecturasCache = lecturasCache.filter(x => x.id !== l.id);

  pintarLecturas();

//// ---------------- TOGGLE TERMINADAS ----------------
//btnToggleTerminadas.addEventListener("click", () => {
//  mostrarTerminados = !mostrarTerminados;
//  btnToggleTerminadas.textContent = mostrarTerminados
//    ? "Ocultar lecturas terminadas"
//    : "Mostrar lecturas terminadas";
//  pintarLecturas();
//});



btnToggleTerminadas.onclick = () => {
  const panel = document.getElementById("panelTerminadas");
  panel.classList.toggle("hidden");

  if (!panel.classList.contains("hidden")) {
    pintarTerminadas(panel);
  }
};

function pintarTerminadas(panel) {
  panel.innerHTML = ""; // Limpiar contenido

  // Filtramos lecturas terminadas
  const terminadas = lecturasCache.filter(l => !l.activa);

  if (terminadas.length === 0) {
    panel.innerHTML = "<p>No hay lecturas ni retos terminados aún</p>";
    return;
  }

  terminadas.forEach(l => {
    const div = document.createElement("div");
    div.className = "lectura-card terminada"; // Clase base

    // Si es un reto, añadimos clase reto-card para borde dorado
    if (l.esReto) div.classList.add("reto-card");

    // Fecha de finalización o del reto
    let fechaTexto = "";
    if (l.fechaFin) {
      const fecha = l.fechaFin?.seconds
        ? new Date(l.fechaFin.seconds * 1000)
        : new Date(l.fechaFin);
      // Para retos, mostrar mes y año; para lecturas normales, día/mes/año
      fechaTexto = l.esReto
        ? `📅 ${fecha.toLocaleDateString("es-ES", { month: 'long', year: 'numeric' })}`
        : `📅 ${fecha.toLocaleDateString("es-ES")}`;
    }

    // Icono de logro/objetivo
    const icono = l.esReto ? "🏆" : "";

    div.innerHTML = `
      <div class="lectura-info">
        <strong>${l.titulo}</strong> ${icono}<br>
        <small>${l.autor}</small><br>

        ${renderizarEstrellas(l.valoracion)}
        <small>Comentario:"${l.comentario}"</small><br>
        ${fechaTexto ? `<div class="fecha-reto">${fechaTexto}</div>` : ""}
      </div>
    `;

    panel.appendChild(div);
  });
}









// ---------------- BÚSQUEDA LIBROS ----------------
async function buscarLibros(texto) {
  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  // key api = &key=AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=5`
  );
  const data = await res.json();
  if (!data.items) return;

  data.items.forEach(libro => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.style.cursor = "pointer";
    li.style.marginBottom = "6px";

    li.textContent = `${info.title} — ${info.authors?.[0] || "Desconocido"}`;

    li.onclick = () => seleccionarLibro({
      titulo: info.title,
      autor: info.authors?.[0],
      paginas: info.pageCount || 0,
      categoria: info.categories?.join(", ") || "",
      portadaUrl: info.imageLinks?.thumbnail
    });

    resultados.appendChild(li);
  });

  // Scroll si hay muchos resultados
  resultados.style.maxHeight = "400px";
  resultados.style.overflowY = "auto";
}


// ---------------- RECOMPENSAS ----------------
function generarRecompensas(paginas) {
  const monedas = Math.floor(Math.random() * (paginas * 1)) + 1;
  const rand = Math.random() * 100;
  let objeto = null;

 if (rand > 95) objeto = OBJETOS_LEGENDARIOS[Math.floor(Math.random() * OBJETOS_LEGENDARIOS.length)];
 else if (rand > 85) objeto = OBJETOS_RAROS[Math.floor(Math.random() * OBJETOS_RAROS.length)];

  return { monedas, objeto };
}

btnBuscar.addEventListener("click", async () => {
  const texto = busquedaLibro.value.trim();
  if (!texto) {
    alert("Escribe algo para buscar");
    return;
  }

  btnBuscar.disabled = true;
  btnBuscar.textContent = "Buscando...";

  try {
    await buscarLibros(texto);
  } finally {
    btnBuscar.disabled = false;
    btnBuscar.textContent = "Buscar";
  }
});

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

  if (!usuarioData || !usuarioData.logros) {
    cont.textContent = "Aún no has desbloqueado logros";
    return;
  }

const logros = Object.values(usuarioData.logros).sort(
  (a, b) => {
    const fa = a.fecha?.seconds
      ? a.fecha.seconds * 1000
      : new Date(a.fecha).getTime();

    const fb = b.fecha?.seconds
      ? b.fecha.seconds * 1000
      : new Date(b.fecha).getTime();

    return fb - fa;
  }
);

  if (logros.length === 0) {
    cont.textContent = "Aún no has desbloqueado logros";
    return;
  }

  logros.forEach(l => {
    const div = document.createElement("div");
    div.className = "logro";

    let fecha;
    if (l.fecha?.seconds) {
      fecha = new Date(l.fecha.seconds * 1000);
    } else {
      fecha = new Date(l.fecha);
    }

    div.innerHTML = `
      <strong>${l.titulo}</strong><br>
      <small>${fecha.toLocaleDateString("es-ES")}</small>
    `;

    cont.appendChild(div);
  });
}

function mostrarNotificacionLogro(logro) {
  alert(`🏆 Logro desbloqueado: ${logro.titulo}`);
}
async function cargarUsuarios() {
  const select = document.getElementById("selectAdmin");
  select.innerHTML = ""; // limpiar

  const snapshot = await getDocs(collection(db, "users")); // ¡users, no usuarios!
  snapshot.forEach(doc => {
    const data = doc.data();

    // No mostrarte a ti mismo
    if (data.role !== "admin") {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${data.nombreReal} (${data.nombrePersonaje})`;
      select.appendChild(option);
    }
  });
}
async function asignarAdmin() {
  const uidNuevoAdmin = selectAdmin.value;
  if (!uidNuevoAdmin) return;

  // Quitar admin temporal anterior
  const q = query(
    collection(db, "users"),
    where("tipoAdmin", "==", "crear")
  );

  const snap = await getDocs(q);

  for (const d of snap.docs) {
    await updateDoc(d.ref, { tipoAdmin: null });
  }

  // Asignar nuevo admin
  await updateDoc(doc(db, "users", uidNuevoAdmin), {
    tipoAdmin: "crear"
  });

  alert("👑 El poder ha sido transferido");

  selectAdmin.style.display = "none";
}

avatarInput.addEventListener("change", async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "avatar_users");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dwuokewzr/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  // Guardas SOLO la URL
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    imagen_avatar: data.secure_url
  });

  avatarImg.src = data.secure_url;
});

function formatearFecha(ts) {
  if (!ts) return "";
  const fecha = ts.toDate();
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
//
//Object.values(logros).forEach(l => {
//  const fecha = l.fecha.seconds ? new Date(l.fecha.seconds * 1000) : new Date(l.fecha);
//  div.innerHTML = `
//    <strong>${l.titulo}</strong><br>
//    <small>${fecha.toLocaleDateString()}</small>
//  `;
//});
function crearEstrellas() {
  const cont = document.getElementById("estrellas");
  cont.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const star = document.createElement("span");
    star.className = "estrella";
    star.textContent = "★";

    star.onclick = () => {
      valoracionActual = i / 2;
      actualizarEstrellas();
    };

    cont.appendChild(star);
  }
}

function actualizarEstrellas() {
  document.querySelectorAll(".estrella").forEach((s, i) => {
    s.classList.toggle("activa", i < valoracionActual * 2);
  });

  document.getElementById("notaValoracion").textContent =
    (valoracionActual * 2).toFixed(1);
}
function iconoLogro(logro) {
  if (logro.tipo === "especial") return "⭐⭐⭐⭐½";
  if (logro.tipo === "competitivo") return "🏆";
  return logro.icono;
}

async function asignarRetosActivos(usuarioId) {
  const retosRef = collection(db, "retos");
  const snapshot = await getDocs(query(retosRef, where("activo", "==", true)));

  for (const retoDoc of snapshot.docs) {
    const retoData = retoDoc.data();
    const idReto = retoDoc.id;

    // Revisar si ya está asignado
    const lecturaSnap = await getDocs(
      query(
        collection(db, "users", usuarioId, "lecturas"),
        where("esReto", "==", true),
        where("idReto", "==", idReto)
      )
    );

    if (lecturaSnap.empty) {
      // Asignar reto al usuario
      await addDoc(collection(db, "users", usuarioId, "lecturas"), {
        idReto,
        titulo: retoData.titulo,
        autor: retoData.autor,
        paginas: retoData.paginas,
        categoria: retoData.categoria || "",
        portadaUrl: retoData.portadaUrl || "",
        esReto: true,
        activa: true,
        progreso: 0,
        fechaInicio: new Date()
      });
    }
  }
}

