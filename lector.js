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
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
  enableIndexedDbPersistence,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { RECOMPENSAS, OBJETOS_RAROS, OBJETOS_LEGENDARIOS, LOGROS } from "./gameConfig.js";

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
const categoriaInput = document.getElementById("comboCategorias");
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

const CATEGORIAS_OFICIALES = [
  "Ficción",
  "No ficción",
  "Fantasía",
  "Ciencia ficción",
  "Historia",
  "Romántica",
  "Erótica",
  "Poesía",
  "Terror",
  "Aventura",
  "Misterio",
  "Juvenil"
];

const CATEGORIAS_MAP = {
  Fiction: "Ficción",
  Novels: "Ficción",
  Nonfiction: "No ficción",
  Fantasy: "Fantasía",
  Science: "Ciencia",
  History: "Historia",
  Romance: "Romance",
  Adventure: "Aventura",
  Mystery: "Misterio",
  "Young Adult": "Juvenil",
  Juvenile: "Juvenil",
  Children: "Juvenil"
  // Agrega más según necesites
};

const btnMochila = document.getElementById("btnMochila");
const panelMochila = document.getElementById("panelMochila");

//const fechaFin = l.fechaFin ?? new Date();

let modoCrearReto = false;

let lecturaPendiente = null;
let valoracionActual = 0;

let usuarioActual = {
  uid: null, // se llenará al cargar el usuario
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

let objetosEquipados = [];

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

  const reto = await cargarRetoMensual();

  //// Mostrar en formulario cuando pulsen “Reto actual”
  //btnReto.onclick = () => {
  //  tituloInput.value = reto.titulo;
  //  autorInput.value = reto.autor;
  //  paginasInput.value = reto.paginas;
  //  categoriaInput.value = reto.categoria;
  //  portadaLibro.src = reto.portadaUrl;
//
  //  leyendoRetoActual = true; // importante para marcarlo como reto
  //};
});

export default {
  data() {
    return {
      OBJETOS_RAROS,
      OBJETOS_LEGENDARIOS,
      usuarioData: {
        nombrePersonaje: "Arwen",
        clase: "Mago/a Sabe-lo-Todo",
        nivel: 5,
        // aquí guardamos los IDs de los objetos que el jugador ha encontrado
        objetosEncontradosIds: ["pluma_fenix", "biblioteca_ancestral"]
      }
    };
  },
  computed: {
    objetosEncontrados() {
      // filtramos raros
      const raros = this.OBJETOS_RAROS.filter((obj) => this.usuarioData.objetosEncontradosIds.includes(obj.id));
      // filtramos legendarios (algunos legendarios en tu config son solo strings)
      const legendarios = this.OBJETOS_LEGENDARIOS.map((obj) =>
        typeof obj === "string" ? { id: obj, titulo: obj, rareza: "legendario", icono: "🌟" } : obj
      ).filter((obj) => this.usuarioData.objetosEncontradosIds.includes(obj.id));

      return [...raros, ...legendarios];
    }
  }
};

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
    experienciaNecesaria: data.experienciaNecesaria ?? xpNecesariaParaNivel(data.nivel ?? 1),
    prestigio: data.prestigio ?? 0,
    monedas: data.monedas ?? 0,
    logros: data.logros ?? {},
    nombrePersonaje: data.nombrePersonaje,
    clase: data.clase,
    objetos: data.objetos ?? {}
  };

  usuarioActual.role = data.role ?? "user";
  usuarioActual.tipoAdmin = data.tipoAdmin ?? null;

  aplicarTemaPorClase(usuarioData.clase);

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

  btnAsignarAdmin.style.display = usuarioActual.role === "admin" ? "inline-block" : "none";

  btnNuevoReto.style.display =
    usuarioActual.role === "admin" || usuarioActual.tipoAdmin === "crear" ? "inline-block" : "none";
}

async function mostrarSelectAdmin() {
  selectAdmin.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach((docSnap) => {
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

  snapshot.forEach((docSnap) => {
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
  const q = query(collection(db, "users"), where("tipoAdmin", "==", "crear"));

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

  snap.forEach((docSnap) => {
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
  // Asegurarse de que categoria sea string
  libro.categoria = libro.categoria || "";

  // Rellenar formulario con todos los datos
  rellenarFormularioLectura(libro);

  // Actualizar combobox de categorías dinámicamente
  if (libro.categoria && !Array.from(categoriaSelect.options).some((opt) => opt.value === libro.categoria)) {
    const nuevaOpcion = document.createElement("option");
    nuevaOpcion.value = libro.categoria;
    nuevaOpcion.textContent = libro.categoria;
    categoriaSelect.appendChild(nuevaOpcion);
  }

  // BOTONES DE ACCIÓN
  if (modoCrearReto) {
    // Cambiar botón de registrar a "Registrar nuevo reto"
    btnRegistrar.textContent = "Registrar nuevo reto";

    // Cuando se haga click, crear el reto en Firestore
btnRegistrar.onclick = async () => {
  if (lecturaPendiente?.esReto) {
    await registrarRetoMensual();
    lecturaPendiente = null; // limpiar
  } else {
    await registrarLecturaNormal();
  }

  // Limpiar formulario
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "";
  portadaLibro.src = "https://via.placeholder.com/120x180";
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

  const cat = libro.categoria || "";

  // Si es select (combobox)
  if (categoriaInput.tagName === "SELECT") {
    let opcionExistente = Array.from(categoriaInput.options).find((opt) => opt.value === cat);

    if (!opcionExistente && cat) {
      const nuevaOpcion = document.createElement("option");
      nuevaOpcion.value = cat;
      nuevaOpcion.textContent = cat;
      categoriaInput.appendChild(nuevaOpcion);
    }

    categoriaInput.value = cat; // seleccionar la opción correcta
  } else {
    categoriaInput.value = cat; // si fuera input normal
  }
}

// ------------------ FUNCIÓN ORIGINAL REGISTRAR LECTURA ------------------
async function registrarLecturaNormal() {
  //if (!usuarioActual) return;
if (!usuarioActual.uid) return;

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

  const ref = await addDoc(collection(db, "users", usuarioActual.uid, "lecturas"), lectura);

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
  xpBarraEl.style.width = `${(usuarioData.experiencia / usuarioData.experienciaNecesaria) * 100}%`;
  xpTextoEl.textContent = `${usuarioData.experiencia} / ${usuarioData.experienciaNecesaria} XP`;
}

// ---------------- RETO ----------------
async function cargarReto() {
  if (retoCache) return retoCache;

  const snap = await getDoc(doc(db, "retos", "reto-actual"));
  if (!snap.exists()) return null;

  retoCache = snap.data();
  return retoCache;
}

//btnReto.addEventListener("click", async () => {
//  const reto = await cargarRetoMensual();
//
//  // Rellenar formulario con los datos del reto
//  tituloInput.value = reto.titulo;
//  autorInput.value = reto.autor;
//  paginasInput.value = reto.paginas;
//  categoriaInput.value = reto.categoria;
//  portadaLibro.src = reto.portadaUrl;
//
//  // Marcar como reto para el registro
//  lecturaPendiente = { ...reto, esReto: true };
//});

async function cargarRetoActual() {

  const retoRef = doc(db, "retos", "reto-actual");
  const snap = await getDoc(retoRef);

  if (!snap.exists()) return null;

  return snap.data();
}

//btnReto.addEventListener("click", async () => {
//
//  const reto = await cargarRetoActual();
//
//  if (!reto) {
//    alert("No hay reto activo");
//    return;
//  }
//
//  // rellenar formulario
//  tituloInput.value = reto.titulo || "";
//  autorInput.value = reto.autor || "";
//  paginasInput.value = reto.paginas || 0;
//  categoriaInput.value = reto.categoria || "";
//  portadaLibro.src = reto.portadaUrl || "https://via.placeholder.com/120x180";
//
//  // marcar como reto
//  lecturaPendiente = {
//    ...reto,
//    esReto: true
//  };
//
//  // cambiar botón
//  btnRegistrar.textContent = "Registrar nuevo reto";
//
//});

btnReto.addEventListener("click", async () => {

  const reto = await cargarRetoMensual();

  if (!reto) {
    alert("Aún no se ha creado el reto de este mes");
    return;
  }

  tituloInput.value = reto.titulo || "";
  autorInput.value = reto.autor || "";
  paginasInput.value = reto.paginas || 0;
  categoriaInput.value = reto.categoria || "";
  portadaLibro.src = reto.portadaUrl || "https://via.placeholder.com/120x180";

  lecturaPendiente = {
    ...reto,
    esReto: true
  };

  btnRegistrar.textContent = "Registrar reto";

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
  const snap = await getDocs(query(collection(db, "users", usuarioActual.uid, "lecturas")));

  lecturasCache = [];
  snap.forEach((d) => lecturasCache.push({ id: d.id, ...d.data() }));

  // Añadir reto si no existe en Firestore
  const reto = await cargarReto();
  const retoEnFirestore = lecturasCache.find((l) => l.esReto);

  if (reto && !retoEnFirestore) {
    const ref = await addDoc(collection(db, "users", usuarioActual.uid, "lecturas"), {
      titulo: reto.titulo,
      autor: reto.autor,
      categoria: reto.categoria,
      paginas: reto.paginas,
      activa: true,
      progreso: 0,
      esReto: true,
      fechaInicio: new Date()
    });
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

  document.getElementById("modalValoracion").classList.remove("hidden");
}

document.getElementById("btnCancelarValoracion").onclick = () => {
  lecturaPendiente = null;
  document.getElementById("modalValoracion").classList.add("hidden");
};

document.getElementById("btnConfirmarValoracion").onclick = async () => {
  if (!lecturaPendiente) return;

  const comentario = document.getElementById("comentarioLectura").value.trim();

  document.getElementById("modalValoracion").classList.add("hidden");

  await finalizarLecturaConRecompensas(lecturaPendiente, valoracionActual, comentario);

  lecturaPendiente = null;

  await addDoc(collection(db, "comentarios"), {
  titulo: l.titulo,
  comentario,
  valoracion,
  usuario: usuarioActual.uid,
  fecha: serverTimestamp()
});

};

async function finalizarLecturaConRecompensas(l, valoracion, comentario) {
  const userRef = doc(db, "users", usuarioActual.uid);
  const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", l.id);

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

    usuarioPrestigio.textContent = Number(usuarioPrestigio.textContent) + l.paginas;

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

  if (recompensa.objeto && recompensa.objeto.id) {
    await otorgarObjeto(recompensa.objeto);

    if (recompensa.objeto.efectos) {
      await aplicarEfectosObjeto(recompensa.objeto.efectos);
    }

  if (recompensa.objeto) {
  mostrarObjetoEncontrado(recompensa.objeto);

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
  const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", lectura.id);

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
  const lista = mostrarTerminados ? lecturasCache : lecturasCache.filter((l) => l.activa);

  // Ordenar primero retos activos, luego lecturas normales
  const retos = lista.filter((l) => l.esReto);
  const normales = lista.filter((l) => !l.esReto);

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
    <small>${l.titulo || ""}</small><br>
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
    card.querySelectorAll(".btn-progreso").forEach((btn) => {
      btn.disabled = !l.activa;
      btn.onclick = () => cambiarProgreso(l, Number(btn.dataset.delta));
    });

    // Botón terminar lectura/reto
    card.querySelector(".btn-terminar").onclick = () => terminarLectura(l);

    // Botón eliminar lectura/reto
    card.querySelector(".btn-eliminar").onclick = async () => {
      const texto = l.esReto ? "⚠️ ¿Eliminar este reto?" : "⚠️ ¿Eliminar esta lectura?";
      if (!confirm(texto)) return;

      if (l.id) {
        await deleteDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id));
      }

      // Eliminar de memoria y repintar
      lecturasCache = lecturasCache.filter((x) => x.id !== l.id);
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
lecturasCache = lecturasCache.filter((x) => x.id !== l.id);

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

  const terminadas = lecturasCache.filter((l) => !l.activa);

  if (terminadas.length === 0) {
    panel.innerHTML = "<p>No hay lecturas ni retos terminados aún</p>";
    return;
  }

  terminadas.forEach((l) => {
    const div = document.createElement("div");
    div.className = "lectura-card terminada";

    if (l.esReto) div.classList.add("reto-card");

    // Fecha
    let fechaTexto = "";
    if (l.fechaFin) {
      const fecha = l.fechaFin?.seconds ? new Date(l.fechaFin.seconds * 1000) : new Date(l.fechaFin);
      fechaTexto = l.esReto
        ? `📅 ${fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
        : `📅 ${fecha.toLocaleDateString("es-ES")}`;
    }

    div.innerHTML = `
      <div class="lectura-info">
        <img src="${l.portadaUrl || "https://via.placeholder.com/60x90"}"
             alt="Portada" style="width:60px; height:90px; float:left; margin-right:8px;">
        <strong>${l.titulo}</strong> ${l.esReto ? "🏆" : ""}<br>
        <small>${l.autor}</small><br>
        ${renderizarEstrellas(l.valoracion)}
        <textarea class="comentario-edit" placeholder="Comentario">${l.comentario || ""}</textarea><br>
        ${fechaTexto ? `<div class="fecha-reto">${fechaTexto}</div>` : ""}
      </div>
      <div class="lectura-acciones">
        <button class="btn-guardar">💾 Guardar cambios</button>
        <button class="btn-eliminar">❌ Eliminar</button>
      </div>
    `;

    // Guardar cambios
    div.querySelector(".btn-guardar").onclick = async () => {
      const nuevoComentario = div.querySelector(".comentario-edit").value.trim();
      const nuevaValoracion = prompt("Nueva puntuación (0-10):", l.valoracion || 0);
      const valorNum = Math.max(0, Math.min(10, Number(nuevaValoracion)));

      const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", l.id);
      await updateDoc(lecturaRef, {
        comentario: nuevoComentario,
        valoracion: valorNum
      });

      l.comentario = nuevoComentario;
      l.valoracion = valorNum;

      pintarTerminadas(panel); // repintar para reflejar cambios
    };

    // Eliminar lectura
    div.querySelector(".btn-eliminar").onclick = async () => {
      if (!confirm("⚠️ ¿Eliminar esta lectura?")) return;
      await deleteDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id));
      lecturasCache = lecturasCache.filter((x) => x.id !== l.id);
      pintarTerminadas(panel);
    };

    panel.appendChild(div);
  });
}

// ---------------- BÚSQUEDA LIBROS ----------------
async function buscarLibros(texto) {
  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  // key api = &key=AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=10&key=AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0`
  );
  const data = await res.json();
  if (!data.items) return;

  data.items.forEach((libro) => {
    const info = libro.volumeInfo;
    const li = document.createElement("li");
    li.style.cursor = "pointer";
    li.style.marginBottom = "6px";

    li.textContent = `${info.title} — ${info.authors?.[0] || "Desconocido"}`;

    li.onclick = () =>
      seleccionarLibro({
        titulo: info.title,
        autor: info.authors?.[0],
        paginas: info.pageCount || 0,
        categoria: normalizarCategoria(info.categories?.[0] || ""),
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
  const monedas = Math.floor(Math.random() * paginas) + 1;
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

      usuarioData.logros[logro.id] = {
        fecha: new Date(),
        titulo: logro.titulo,
        efectos: logro.efectos
      };

      if (logro.efectos) {
        await aplicarEfectosLogro(logro.efectos);
      }

      let mensaje = `🏆 ${logro.titulo}`;
      if (logro.efectos?.xp) mensaje += `\n+${logro.efectos.xp} XP`;
      if (logro.efectos?.monedas) mensaje += `\n+${logro.efectos.monedas} monedas`;
      if (logro.efectos?.prestigio) mensaje += `\n+${logro.efectos.prestigio} prestigio`;

      alert(mensaje);

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

  const logros = Object.values(usuarioData.logros).sort((a, b) => {
    const fa = a.fecha?.seconds ? a.fecha.seconds * 1000 : new Date(a.fecha).getTime();

    const fb = b.fecha?.seconds ? b.fecha.seconds * 1000 : new Date(b.fecha).getTime();

    return fb - fa;
  });

  if (logros.length === 0) {
    cont.textContent = "Aún no has desbloqueado logros";
    return;
  }

  logros.forEach((l) => {
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
  snapshot.forEach((doc) => {
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
  const q = query(collection(db, "users"), where("tipoAdmin", "==", "crear"));

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

  const res = await fetch("https://api.cloudinary.com/v1_1/dwuokewzr/image/upload", {
    method: "POST",
    body: formData
  });

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

  document.getElementById("notaValoracion").textContent = (valoracionActual * 2).toFixed(1);
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
      query(collection(db, "users", usuarioId, "lecturas"), where("esReto", "==", true), where("idReto", "==", idReto))
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
function normalizarClase(nombre) {
  return nombre
    .toLowerCase()
    .normalize("NFD") // quita tildes
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\/a|\/o/g, "") // quita /a /o
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const TEMAS_CLASES = {
  "mago-sabe-lo-todo": {
    primario: "#7c3aed",
    secundario: "#c4b5fd",
    acento: "#f0abfc",
    fondo: "#1e1b4b"
  },

  "bardo-cuentacuentos": {
    primario: "#db2777",
    secundario: "#f9a8d4",
    acento: "#fde68a",
    fondo: "#2b1120"
  },

  "caballero-de-las-palabras": {
    primario: "#2563eb",
    secundario: "#bfdbfe",
    acento: "#facc15",
    fondo: "#0f172a"
  },

  "picaro-de-los-post-it": {
    primario: "#059669",
    secundario: "#6ee7b7",
    acento: "#34d399",
    fondo: "#022c22"
  },

  "druida-romantasy": {
    primario: "#16a34a",
    secundario: "#bbf7d0",
    acento: "#f472b6",
    fondo: "#052e16"
  },

  "inventor-de-tramas": {
    primario: "#0ea5e9",
    secundario: "#bae6fd",
    acento: "#fbbf24",
    fondo: "#082f49"
  },

  "explorador-de-bibliotecas": {
    primario: "#ca8a04",
    secundario: "#fde68a",
    acento: "#84cc16",
    fondo: "#2e1a04"
  },

  "alquimista-de-historias": {
    primario: "#9333ea",
    secundario: "#e9d5ff",
    acento: "#22d3ee",
    fondo: "#2e1065"
  },

  guardabibliotecas: {
    primario: "#475569",
    secundario: "#cbd5e1",
    acento: "#38bdf8",
    fondo: "#020617"
  },

  "adivinador-de-tramas": {
    primario: "#a21caf",
    secundario: "#f5d0fe",
    acento: "#fde047",
    fondo: "#3b0764"
  },

  "hechicero-de-tochos-imposibles": {
    primario: "#7f1d1d",
    secundario: "#fecaca",
    acento: "#fb7185",
    fondo: "#2a0f0f"
  },

  "viajero-de-mundos-paralelos": {
    primario: "#0f766e",
    secundario: "#99f6e4",
    acento: "#818cf8",
    fondo: "#042f2e"
  },

  "senor-de-las-comillas": {
    primario: "#1f2937",
    secundario: "#d1d5db",
    acento: "#facc15",
    fondo: "#020617"
  },

  "monje-de-los-ensayos": {
    primario: "#92400e",
    secundario: "#fde68a",
    acento: "#a3e635",
    fondo: "#2a1606"
  },

  "gladiador-poetico": {
    primario: "#be123c",
    secundario: "#fecdd3",
    acento: "#fde047",
    fondo: "#3f0a1c"
  },

  "cazador-de-spoilers": {
    primario: "#f97316",
    secundario: "#fed7aa",
    acento: "#fde047",
    fondo: "#2a1506"
  },

  "pirata-de-libros-digitales": {
    primario: "#0284c7",
    secundario: "#bae6fd",
    acento: "#22d3ee",
    fondo: "#082f49"
  },

  "arquero-de-la-lectura": {
    primario: "#15803d",
    secundario: "#bbf7d0",
    acento: "#84cc16",
    fondo: "#052e16"
  },

  "alquimista-de-cafe-y-libros": {
    primario: "#78350f",
    secundario: "#fde68a",
    acento: "#fb7185",
    fondo: "#2a1606"
  },

  "ladron-de-libros": {
    primario: "#334155",
    secundario: "#cbd5e1",
    acento: "#94a3b8",
    fondo: "#020617"
  }
};

function aplicarTemaPorClase(clase) {
  if (!clase) return;

  const clave = normalizarClase(clase);
  const tema = TEMAS_CLASES[clave];

  if (!tema) return; // usa el tema base

  const root = document.documentElement;

  root.style.setProperty("--color-primario", tema.primario);
  root.style.setProperty("--color-secundario", tema.secundario);
  root.style.setProperty("--color-acento", tema.acento);
  root.style.setProperty("--fondo-panel", tema.fondo);
}

async function aplicarEfectosLogro(efectos) {
  const userRef = doc(db, "users", usuarioActual.uid);

  const updates = {};

  // XP
  if (efectos.xp) {
    usuarioData.experiencia += efectos.xp;
    updates.experiencia = usuarioData.experiencia;
  }

  // Monedas
  if (efectos.monedas) {
    usuarioData.monedas += efectos.monedas;
    updates.monedas = increment(efectos.monedas);
  }

  // Prestigio
  if (efectos.prestigio) {
    usuarioData.prestigio += efectos.prestigio;
    updates.prestigio = increment(efectos.prestigio);
  }

  // Subidas de nivel por XP
  if (efectos.xp) {
    actualizarXP(true);
    updates.nivel = usuarioData.nivel;
    updates.experienciaNecesaria = usuarioData.experienciaNecesaria;
  }

  if (Object.keys(updates).length > 0) {
    await updateDoc(userRef, updates);
  }
}
function normalizarCategoria(cat) {
  if (!cat) return "";

  // Si existe en el mapa, usamos la traducción
  if (CATEGORIAS_MAP[cat]) return CATEGORIAS_MAP[cat];

  // Si no existe, dejamos tal cual
  return cat;
}

async function subirPortada(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "portadas");

  const res = await fetch("https://api.cloudinary.com/v1_1/dwuokewzr/image/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data.secure_url; // URL de la imagen en Cloudinary
}

async function agregarLectura(titulo, autor, filePortada) {
  let portadaUrl = "";
  if (filePortada) {
    portadaUrl = await subirPortada(filePortada);
  }

  const nuevaLectura = {
    titulo,
    autor,
    comentario: "",
    valoracion: 0,
    activa: true,
    portadaUrl,
    fechaInicio: new Date()
  };

  const docRef = await addDoc(collection(db, "users", usuarioActual.uid, "lecturas"), nuevaLectura);
  lecturasCache.push({ ...nuevaLectura, id: docRef.id });
}

export function aplicarEfectos(effects, stats) {
  if (!effects) return;

  Object.entries(effects).forEach(([key, value]) => {
    if (typeof value === "number") {
      stats[key] = (stats[key] || 0) + value;
    }
  });
}

objetosEquipados.forEach((obj) => aplicarEfectos(obj.efectos, stats));

async function otorgarObjeto(objeto) {
  if (!objeto?.id) return;

  const userRef = doc(db, "users", usuarioActual.uid);

  // Evitar duplicados
  if (usuarioData.objetos?.[objeto.id]) return;

  usuarioData.objetos ??= {};
  usuarioData.objetos[objeto.id] = {
    id: objeto.id,
    rareza: objeto.rareza,
    fecha: new Date()
  };

  await updateDoc(userRef, {
    [`objetos.${objeto.id}`]: {
      rareza: objeto.rareza,
      fecha: serverTimestamp()
    }
  });

  alert(`🎁 Has obtenido: ${objeto.titulo}`);
}

async function aplicarEfectosObjeto(efectos) {
  if (!efectos) return;

  const userRef = doc(db, "users", usuarioActual.uid);
  const updates = {};

  if (efectos.xp) {
    usuarioData.experiencia += efectos.xp;
    updates.experiencia = usuarioData.experiencia;
  }

  if (efectos.monedas) {
    usuarioData.monedas += efectos.monedas;
    updates.monedas = increment(efectos.monedas);
  }

  if (efectos.prestigio) {
    usuarioData.prestigio += efectos.prestigio;
    updates.prestigio = increment(efectos.prestigio);
  }

  if (Object.keys(updates).length) {
    actualizarXP(true);
    updates.nivel = usuarioData.nivel;
    updates.experienciaNecesaria = usuarioData.experienciaNecesaria;
    await updateDoc(userRef, updates);
  }
}

async function cargarHallOfFame() {
  const rankingDiv = document.getElementById("ranking");
  rankingDiv.innerHTML = "Cargando ranking...";

  const q = query(collection(db, "users"), orderBy("prestigio", "desc"), orderBy("nivel", "desc"), limit(10));

  const snap = await getDocs(q);
  rankingDiv.innerHTML = "";

  let posicion = 1;

  snap.forEach((doc) => {
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

btnMochila.onclick = () => {
  panelMochila.classList.toggle("hidden");

  if (!panelMochila.classList.contains("hidden")) {
    cargarMochila();
  }
};

function cargarMochila() {
  pintarInventario();
  pintarBiblioteca();
}

function pintarInventario() {
  const grid = document.getElementById("inventarioGrid");
  grid.innerHTML = "";

  const objetosUsuario = usuarioData.objetos || {};

  Object.keys(objetosUsuario).forEach((id) => {
    const obj = OBJETOS_RAROS.find((o) => o.id === id) || OBJETOS_LEGENDARIOS.find((o) => o.id === id);

    if (!obj) return;

    const slot = document.createElement("div");
    slot.className = `slot ${obj.rareza}`;

    slot.innerHTML = `
      ${obj.icono || "📦"}

      <div class="tooltip">
        <strong>${obj.titulo}</strong><br>
        Rareza: ${obj.rareza}
      </div>
    `;

    slot.onclick = () => equiparObjeto(obj);

    grid.appendChild(slot);
  });
}

function equiparObjeto(obj) {
  if (objetosEquipados.find((o) => o.id === obj.id)) return;

  if (objetosEquipados.length >= 3) {
    alert("Solo puedes equipar 3 objetos");
    return;
  }

  objetosEquipados.push(obj);

  pintarEquipo();
}

function pintarEquipo() {
  const cont = document.getElementById("equipoObjetos");
  cont.innerHTML = "";

  objetosEquipados.forEach((obj) => {
    const div = document.createElement("div");
    div.className = `slot ${obj.rareza}`;

    div.innerHTML = obj.icono;

    div.onclick = () => {
      objetosEquipados = objetosEquipados.filter((o) => o.id !== obj.id);
      pintarEquipo();
    };

    cont.appendChild(div);
  });
}

function pintarBiblioteca() {
  const cont = document.getElementById("bibliotecaGrid");
  cont.innerHTML = "";

  const libros = lecturasCache.filter((l) => !l.activa);

  libros.forEach((l) => {
    const card = document.createElement("div");
    card.className = "libro-card";

    card.innerHTML = `
      <img src="${l.portadaUrl || "https://via.placeholder.com/60x90"}">

      <div>
        <strong>${l.titulo}</strong>
        <br>
        <small>${l.autor}</small>
        ${renderizarEstrellas(l.valoracion)}
      </div>
    `;

    cont.appendChild(card);
  });
}

function mostrarObjetoEncontrado(obj) {

  if (!obj || !obj.titulo) return; // ⛔ evita popup vacío

  const popup = document.getElementById("popupObjeto");
  const icono = document.getElementById("objetoAnimado");
  const nombre = document.getElementById("nombreObjeto");
  const rareza = document.getElementById("rarezaObjeto");

  icono.textContent = obj.icono || "📦";
  nombre.textContent = obj.titulo;
  rareza.textContent = "Rareza: " + obj.rareza;

  popup.classList.remove("hidden");
}

function cerrarPopupObjeto() {
  document.getElementById("popupObjeto").classList.add("hidden");
}
//function idRetoMesActual() {
//  const now = new Date();
//  const year = now.getFullYear();
//  const month = String(now.getMonth() + 1).padStart(2, "0"); // enero = 0
//  return `${year}-${month}`;
//}

function idRetoMesActual() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

//async function cargarRetoMensual() {
//  const idReto = idRetoMesActual();
//  const retoRef = doc(db, "retos", idReto);
//  const snap = await getDoc(retoRef);
//
//  if (snap.exists()) {
//    return snap.data(); // ya existe el reto del mes
//  } else {
//    // Crear reto automático del mes
//    const retoAuto = {
//      titulo: "Reto del mes",
//      autor: "Autor desconocido",
//      categoria: "Ficción",
//      paginas: 100 + Math.floor(Math.random() * 200), // 100 a 300 páginas
//      portadaUrl: "https://via.placeholder.com/120x180",
//      fechaCreacion: new Date()
//    };
//
//    await setDoc(retoRef, retoAuto);
//    return retoAuto;
//  }
//}

async function cargarRetoMensual() {

  const id = idRetoMesActual();

  const retoRef = doc(db, "retos", id);
  const snap = await getDoc(retoRef);

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
}

async function registrarRetoMensual() {
  if (!lecturaPendiente) return;

  // Verificar si ya existe un reto activo para este mes
  const mesActual = idRetoMesActual();
  const lecturasReto = lecturasCache.filter(
  (l) => l.esReto && l.activa && l.mesId === mesActual
);

  if (lecturasReto.length > 0) {
    alert("⚠️ Ya tienes activo el reto de este mes");
    return;
  }

  // Registrar lectura en Firestore
  const ref = await addDoc(collection(db, "users", usuarioActual.uid, "lecturas"), {
    titulo: lecturaPendiente.titulo,
    autor: lecturaPendiente.autor,
    paginas: lecturaPendiente.paginas,
    categoria: lecturaPendiente.categoria,
    portadaUrl: lecturaPendiente.portadaUrl,
    activa: true,
    progreso: 0,
    esReto: true,
    fechaInicio: new Date(),
    mesId: mesActual // identificador del mes para histórico
  });

  lecturasCache.unshift({
    id: ref.id,
    ...lecturaPendiente,
    activa: true,
    progreso: 0,
    esReto: true,
    fechaInicio: new Date(),
    mesId: mesActual
  });

  pintarLecturas();
  alert("🏆 ¡Reto mensual registrado!");
  btnRegistrar.textContent = "Registrar lectura";
}

async function crearRetoDelMes(libro) {

  const id = idRetoMesActual();

  await setDoc(doc(db, "retos", id), {
    titulo: libro.titulo,
    autor: libro.autor,
    paginas: libro.paginas,
    categoria: libro.categoria,
    portadaUrl: libro.portadaUrl,
    creadoPor: usuarioActual.uid,
    fechaCreacion: serverTimestamp()
  });

  alert("🏆 Reto del mes creado");

}

async function cargarComentarios() {
  const comentarios = [];

  const usersSnap = await getDocs(collection(db, "users"));

  for (const user of usersSnap.docs) {
    const lecturasSnap = await getDocs(
      collection(db, "users", user.id, "lecturas")
    );

    lecturasSnap.forEach((doc) => {
      const data = doc.data();

      if (data.comentario && data.valoracion) {
        comentarios.push(data);
      }
    });
  }

  return comentarios;
}

function mezclarArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function mostrarComentarios() {

  const comentarios = await cargarComentarios();

  const aleatorios = mezclarArray(comentarios).slice(0,3);

  const contenedor = document.getElementById("comentarios-home");
  contenedor.innerHTML = "";

  aleatorios.forEach(c => {

    const div = document.createElement("div");

    div.innerHTML = `
      <div class="comentario-card">
        <div>${renderizarEstrellas(c.valoracion)}</div>
        <p>"${c.comentario}"</p>
        <small>${c.titulo}</small>
      </div>
    `;

    contenedor.appendChild(div);

  });

}

document.getElementById("popupObjeto").addEventListener("click", (e) => {
  if (e.target.id === "popupObjeto") {
    cerrarPopupObjeto();
  }
});
