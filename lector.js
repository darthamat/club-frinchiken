
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

// const listaLecturasEl = document.getElementById("listaLecturas");
const btnToggleTerminadas = document.createElement("button");
const btnToggleTerminadasLibres = document.createElement("button");

btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
btnToggleTerminadasLibres.textContent = "Mostrar lecturas terminadas";

// listaLecturasEl.parentNode.insertBefore(btnToggleTerminadas, listaLecturasEl.nextSibling);
const btnBuscar = document.getElementById("btnBuscar");

const usuarioXP = document.getElementById("xpUsuario");
const usuarioPrestigio = document.getElementById("usuarioPrestigio");
const usuarioMonedas = document.getElementById("usuarioMonedas");

const btnAsignarAdmin = document.getElementById("btn-asignar-admin");
const btnNuevoReto = document.getElementById("btn-nuevo-reto");
const selectAdmin = document.getElementById("selectAdmin");

const listaRetosEl = document.getElementById("listaRetos");
btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
listaRetosEl.parentNode.insertBefore(btnToggleTerminadas, listaRetosEl.nextSibling);

const listaLibresEl = document.getElementById("listaLibres");
btnToggleTerminadas.textContent = "Mostrar lecturas terminadas";
listaLibresEl.parentNode.insertBefore(btnToggleTerminadasLibres, listaLibresEl.nextSibling);

const terminadasModal = document.getElementById("terminadasModal");
const listaTerminadasEl = document.getElementById("listaTerminadas");
const cerrarTerminadasBtn = document.getElementById("cerrarTerminadas");

let modoCrearReto = false;

let usuarioActual = {
  uid: null,       // se llenará al cargar el usuario
  role: null,
  tipoAdmin: null
};


// ---------------- ESTADO ----------------
//let usuarioActual = null;
let usuarioData = null;
let lecturasCache = [];
let retoCache = null;
let mostrarTerminados = false;
let mostrarTerminadosLibres = false;


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 🔑 ESTA LÍNEA ES LA CLAVE
  usuarioActual.uid = user.uid;

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
    experienciaNecesario:
      data.experienciaNecesario ?? xpNecesariaParaNivel(data.nivel ?? 1),
   prestigio: Number(data.prestigio) || 0,
    monedas: Number(data.monedas) || 0,
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

 usuarioData.objetos = data.objetos ?? [];
  aplicarEfectosObjetos();
  pintarObjetos();  // <--- aquí

  usuarioData.objetos.push(recompensa.objeto.nombre);
await updateDoc(doc(db, "users", usuarioActual.uid), {
  objetos: arrayUnion(recompensa.objeto.nombre)
});


   usuarioData.objetos = data.objetos ?? [];
  aplicarEfectosObjetos();

pintarObjetos();  // <--- actualizar UI
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

btnAsignarAdmin.addEventListener("click", async () => {
  if (usuarioActual.role !== "admin") return;

  selectAdmin.style.display = "inline-block";
  await cargarUsuariosParaAdmin();
});


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
  selectAdmin.value = "";
});

btnNuevoReto.addEventListener("click", activarModoCrearReto);



function mostrarMensajeReto(texto) {
  const msg = document.getElementById("mensajeReto");
  msg.textContent = texto;
  msg.classList.remove("hidden");
}


async function crearRetoConLibro(libro) {
  const retoRefActual = doc(db, "retos", "reto-actual");
  const snapActual = await getDoc(retoRefActual);

  // 1️⃣ Guardar reto anterior como pendiente si existía
  if (snapActual.exists()) {
    const retoAnterior = snapActual.data();
    const lecturaAnterior = lecturasCache.find(l => l.idReto === retoAnterior.idReto);
    if (lecturaAnterior) lecturaAnterior.esActual = false;
  }

  // 2️⃣ Crear nuevo reto actual
  const retoData = {
    titulo: libro.titulo,
    autor: libro.autor,
    categoria: libro.categoria ?? "",
    portadaUrl: libro.portadaUrl ?? null,
    paginas: libro.paginas ?? 0,
    creadoPor: usuarioActual.uid,
    fecha: new Date(),
    esReto: true,
    esActual: true,
    activa: true,
    progreso: 0
  };

  await setDoc(retoRefActual, retoData);

  // 3️⃣ Añadir al cache
  lecturasCache.unshift({ ...retoData, idReto: "reto-actual" });

  // 4️⃣ Pintar paneles
  pintarRetos();
  pintarRetosPendientes();
  pintarRetosHistoricos();

  alert("🏆 Nuevo reto creado con éxito");
}

// Función para generar un ID histórico secuencial
async function generarIdRetoHistorico() {
  const snap = await getDocs(collection(db, "retos"));
  const year = new Date().getFullYear();

  let maxNumero = 0;
  snap.forEach(docSnap => {
    const match = docSnap.id.match(new RegExp(`^${year}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNumero) maxNumero = num;
    }
  });

  const nuevoNumero = (maxNumero + 1).toString().padStart(2, "0");
  return `${year}-${nuevoNumero}`;
}

// ------------------ SELECCIONAR LIBRO ------------------
function seleccionarLibro(libro) {
  // Rellenar el formulario con los datos del libro
  rellenarFormularioLectura(libro);

  // Cambiar comportamiento del botón según modo
  if (modoCrearReto) {
    btnRegistrar.textContent = "Registrar nuevo reto";


  } else {
    // Lectura normal
    btnRegistrar.textContent = "Registrar lectura";

  }
  pintarLecturas();
}

// ------------------ RELLENAR FORMULARIO ------------------
function rellenarFormularioLectura(libro) {
  tituloInput.value = libro.titulo || "";
  autorInput.value = libro.autor || "";
  paginasInput.value = libro.paginas || 0;
  portadaLibro.src = libro.portadaUrl || "https://via.placeholder.com/120x180";

  // Categoría solo si existe
  // categoriaInput.value = libro.categoria || "";
  if (libro.categoria) {
  asegurarCategoriaEnSelect(libro.categoria);
}

}

// ------------------ FUNCIÓN ORIGINAL REGISTRAR LECTURA ------------------
async function registrarLecturaNormal() {
  if (!usuarioActual) return;

  const lectura = {
    titulo: tituloInput.value.trim(),
    autor: autorInput.value.trim(),
    paginas: Number(paginasInput.value) || 0,
    categoria: categoriaInput?.value ?? "",
    portadaUrl: portadaLibro.src ?? null,
    activa: true,
    progreso: 0,
    esReto: false,
    fechaInicio: new Date()
  };

  if (!lectura.titulo || !lectura.autor) {
    return alert("Faltan datos");
  }

  // Guardar en Firestore
  const ref = await addDoc(
    collection(db, "users", usuarioActual.uid, "lecturas"),
    lectura
  );

  // Guardar en cache local y pintar
  lecturasCache.unshift({ id: ref.id, ...lectura });
  pintarLecturas();

  // Limpiar formulario y resultados
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
usuarioData.experienciaNecesario =
  xpNecesariaParaNivel(usuarioData.nivel);

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

  const snap = await getDoc(doc(db, "retos", "reto-actual"));
  if (!snap.exists()) return null;

  retoCache = snap.data();
  return retoCache;
}

btnReto.addEventListener("click", async () => {
  const snap = await getDoc(doc(db, "retos", "reto-actual"));
  if (!snap.exists()) {
    alert("No hay un reto activo");
    return;
  }

  const reto = snap.data();

  // Solo rellenar formulario (visual)
  tituloInput.value = reto.titulo || "";
  autorInput.value = reto.autor || "";
  paginasInput.value = reto.paginas || "";
  categoriaInput.value = reto.categoria || "";
  portadaLibro.src = reto.portadaUrl || "https://via.placeholder.com/120x180";

});





// ---------------- CARGAR LECTURAS ----------------
async function cargarLecturas() {
  if (!usuarioActual) return;

  // 1️⃣ Traer lecturas del usuario
  const snap = await getDocs(
    collection(db, "users", usuarioActual.uid, "lecturas")
  );
  lecturasCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 2️⃣ Traer reto actual desde colección general de retos
  const snapReto = await getDoc(doc(db, "retos", "reto-actual"));
  if (snapReto.exists()) {
    const retoActual = snapReto.data();
    retoActual.idReto = "reto-actual";

    let retoExistente = lecturasCache.find(
      l => l.esReto && l.idReto === retoActual.idReto
    );

    if (!retoExistente) {
      lecturasCache.unshift({
        ...retoActual,
        esReto: true,
        esActual: true,
        activa: true
      });
    } else {
      retoExistente.esActual = true;
      retoExistente.activa = true;
    }
  }

  // 3️⃣ Pintar paneles
  pintarRetos();           // Reto actual
  pintarRetosPendientes(); // Retos activos restantes
  pintarRetosHistoricos(); // Retos completados
  pintarLecturas();        // Solo lecturas libres
}


async function comprobarLogrosGlobales() {
  for (const l of lecturasCache) {
    await comprobarLogros(l);
  }
}

// ---------------- TERMINAR LECTURA ----------------
async function terminarLectura(l) {
  if (!usuarioActual || !l?.id) return;

  // No dejar terminar reto virtual de la UI (temporal)
  if (l.id === "reto-actual" && l.retoActual) {
    alert("⚠️ Debes registrar el reto antes de terminarlo");
    return;
  }

  const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", l.id);
  await updateDoc(lecturaRef, {
    activa: false,
    progreso: 100,
    fechaFin: new Date(),
     fechaFinUsuario: new Date()
  });

  l.activa = false;

  if (l.esReto) {
    usuarioData.experiencia += Number(l.paginas);
    actualizarXP();

    if (l.retoActual) {
      // solo logros para el reto actual
      await comprobarLogros(l);
      alert(`🏆 Reto completado (+${l.paginas} XP)`);
    } else {
      // reto antiguo → solo XP, sin logros de tiempo
      alert(`📚 Reto antiguo completado (+${l.paginas} XP)`);
    }

    // actualizar Firestore
    await updateDoc(doc(db, "users", usuarioActual.uid), {
      experiencia: usuarioData.experiencia,
      nivel: usuarioData.nivel,
      experienciaNecesario: usuarioData.experienciaNecesario
    });
  } else {
    // Lectura libre
    usuarioData.prestigio += Number(l.paginas);
    await updateDoc(doc(db, "users", usuarioActual.uid), {
      prestigio: usuarioData.prestigio
    });
    usuarioPrestigio.textContent = usuarioData.prestigio;
    alert(`⭐ Lectura completada (+${l.paginas} prestigio)`);
  }

  await updateDoc(doc(db, "users", usuarioActual.uid), {
  objetos: arrayUnion(objeto.nombre)
});

  pintarLecturas();
}


function pintarLecturas() {
  listaLibresEl.innerHTML = "";

  const listaLibres = lecturasCache
    .filter(l => !l.esReto)
    .filter(l => mostrarTerminadosLibres || l.activa);

  listaLibres.forEach(l => {
    const card = crearCardLectura(l);
    listaLibresEl.appendChild(card);
  });
}


// ---------------- TOGGLE TERMINADAS ----------------
btnToggleTerminadas.addEventListener("click", () => {
  mostrarTerminadas("reto");
});

btnToggleTerminadasLibres.addEventListener("click", () => {
  mostrarTerminadas("libre");
});



// ---------------- BÚSQUEDA LIBROS ----------------
async function buscarLibros(texto) {
  resultados.innerHTML = "";
  resultados.classList.remove("hidden");

  // key api = &key=AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(texto)}&maxResults=20&key=AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0`
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
      categoria: info.categories?.[0] || "",
      portadaUrl: info.imageLinks?.thumbnail
    });

    resultados.appendChild(li);
  });

  // Scroll si hay muchos resultados
  resultados.style.maxHeight = "400px";
  resultados.style.overflowY = "auto";
}


// ---------------- RECOMPENSAS ----------------
async function generarRecompensas(paginas) {
  const maxMonedas = Math.max(1, Math.floor(paginas * 0.4));
  const monedas = Math.floor(Math.random() * maxMonedas) + 1;

  const rand = Math.random() * 100;
  let objeto = null;

  // Elegir objeto legendario aleatorio
  if (rand > 95) {
    // Filtrar solo los que nadie tiene
    const disponibles = [];
    for (const obj of OBJETOS_LEGENDARIOS) {
      const q = query(
        collection(db, "users"),
        where("objetos", "array-contains", obj.nombre)
      );
      const snap = await getDocs(q);
      if (snap.empty) disponibles.push(obj);
    }

    if (disponibles.length > 0) {
      objeto = disponibles[Math.floor(Math.random() * disponibles.length)];
    }
  }
  // ... efecto raro
  else if (rand > 85) objeto = OBJETOS_RAROS[Math.floor(Math.random() * OBJETOS_RAROS.length)];

  //...magicos
   else if (rand > 90) objeto = OBJETOS_MAGICOS[Math.floor(Math.random() * OBJETOS_MAGICOS.length)];

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
  return Math.floor(300 + Math.pow(nivel, 1.5) * 120);
}

//logros

async function comprobarLogros(lecturaActual = null) {
  const userRef = doc(db, "users", usuarioActual.uid);
  usuarioData.logros ??= {};

  for (const logro of LOGROS) {
    if (usuarioData.logros[logro.id]) continue;

    const cumple = logro.condicion?.(lecturasCache, lecturaActual);
    if (!cumple) continue;

    const ahora = new Date();

    // Guardar el logro con la fecha exacta
    usuarioData.logros[logro.id] = {
      fecha: ahora,        // FECHA exacta de obtención
      titulo: logro.titulo
    };

    await updateDoc(userRef, {
      [`logros.${logro.id}`]: {
        fecha: ahora,
        titulo: logro.titulo
      }
    });

    mostrarNotificacionLogro(logro);
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


function normalizarCategoria(cat) {
  return cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function asegurarCategoriaEnSelect(categoria) {
  if (!categoria) return;

  const valor = normalizarCategoria(categoria);

  // ¿Ya existe?
  const existe = [...categoriaInput.options].some(
    o => o.dataset.norm === valor
  );

  if (!existe) {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    option.dataset.norm = valor;
    categoriaInput.appendChild(option);
  }

  categoriaInput.value = categoria;
}
async function cambiarProgreso(lectura, delta) {
  // Ajustar el progreso localmente
  lectura.progreso = Math.min(100, Math.max(0, (lectura.progreso || 0) + delta));

  // Actualizar la barra visual
  const cardReto = [...listaRetosEl.children].find(c => c.dataset.id === lectura.id);
  const cardLibre = [...listaLibresEl.children].find(c => c.dataset.id === lectura.id);

  [cardReto, cardLibre].forEach(card => {
    if (card) {
      const fill = card.querySelector(".fill");
      const span = card.querySelector(".lectura-progreso span");

      fill.style.width = lectura.progreso + "%";
      span.textContent = lectura.progreso + "%";
    }
  });

  // Guardar progreso en Firestore
  try {
    const lecturaRef = doc(db, "users", usuarioActual.uid, "lecturas", lectura.id);
    await updateDoc(lecturaRef, { progreso: lectura.progreso });
  } catch (error) {
    console.error("Error guardando progreso:", error);
  }
}

// Función auxiliar para crear una card
function crearCardLectura(l) {
  const card = document.createElement("div");
  card.className = "lectura-card";
  card.dataset.id = l.id;

const tipoBadge = l.esReto
  ? l.esActual ? "🏆 Reto actual" : "📚 Reto pendiente"
  : "📗 Lectura libre";

  if (l.esReto) card.classList.add("reto");
  else card.classList.add("libre");

  card.innerHTML = `
    <span class="badge ${l.esReto ? "ret2o" : "libre"}">
      ${tipoBadge}
    </span>

    <div class="lectura-info">
      <strong>${l.titulo}</strong><br>
      <small>${l.autor}</small>
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
      <button class="btn-terminar">${l.esReto ? "🏆 Terminar reto" : "📗 Terminar libro"}</button>
      <button class="btn-eliminar">❌</button>
    </div>
  `;

  // Eventos
  card.querySelectorAll(".btn-progreso").forEach(btn => {
    btn.onclick = () => cambiarProgreso(l, Number(btn.dataset.delta));
  });

  card.querySelector(".btn-terminar").onclick = () => terminarLectura(l);

  card.querySelector(".btn-eliminar").onclick = async () => {
    if (!confirm(l.esReto ? "⚠️ ¿Eliminar este reto?" : "⚠️ ¿Eliminar esta lectura?")) return;
    await deleteDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id));
    lecturasCache = lecturasCache.filter(x => x.id !== l.id);
    pintarLecturas();
  };

  if (!l.activa && l.id !== "reto-actual") {
  const acciones = card.querySelector(".lectura-acciones");
  if (acciones) acciones.style.display = "none";
}

  return card;
}




// Abrir modal de terminadas (puedes usarlo para retos o libres)
function mostrarTerminadas(panel) {
  // panel = "reto" o "libre"
  listaTerminadasEl.innerHTML = "";

  const terminadas = lecturasCache.filter(l => !l.activa && ((panel === "reto") ? l.esReto : !l.esReto));

  if (terminadas.length === 0) {
    listaTerminadasEl.innerHTML = "<li>No hay lecturas terminadas</li>";
  } else {
    terminadas.forEach(l => {
      const li = document.createElement("li");
      li.textContent = l.titulo;

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "❌";
      btnEliminar.onclick = async () => {
        if (!confirm("¿Eliminar este registro?")) return;
        await deleteDoc(doc(db, "users", usuarioActual.uid, "lecturas", l.id));
        lecturasCache = lecturasCache.filter(x => x.id !== l.id);
        li.remove();
      };

      li.appendChild(btnEliminar);
      listaTerminadasEl.appendChild(li);
    });
  }

  terminadasModal.classList.remove("hidden");
}

// Cerrar modal
cerrarTerminadasBtn.addEventListener("click", () => {
  terminadasModal.classList.add("hidden");
});

function activarModoCrearReto() {
  modoCrearReto = true; // ⬅️ Muy importante
  const panel = document.querySelector(".registro-lectura");

  // Cambiar el botón de registrar lectura a “Registrar nuevo reto”
  btnRegistrar.textContent = "Registrar nuevo reto";

  // Limpiar formulario
  tituloInput.value = "";
  autorInput.value = "";
  paginasInput.value = "";
  categoriaInput.value = "";
  portadaLibro.src = "https://via.placeholder.com/120x180";

  // Mostrar mensaje instructivo
  mostrarMensajeReto("📖 Selecciona el libro para el nuevo reto");

  // Hacer scroll al panel
  panel.scrollIntoView({ behavior: "smooth", block: "center" });

  // Agregar clase visual
  panel.classList.add("modo-reto");
}


btnRegistrar.addEventListener("click", async () => {
  if (!tituloInput.value || !autorInput.value) {
    alert("Faltan datos");
    return;
  }

  if (modoCrearReto) {
    // ✅ Crear el nuevo reto
    await crearRetoConLibro({
      titulo: tituloInput.value,
      autor: autorInput.value,
      paginas: paginasInput.value,
      categoria: categoriaInput.value,
      portadaUrl: portadaLibro.src
    });

    // Reset de modo
    modoCrearReto = false;
    btnRegistrar.textContent = "Registrar lectura";

    // Ocultar mensaje
    const panel = document.querySelector(".registro-lectura");
    panel.classList.remove("modo-reto");
    mostrarMensajeReto("");

  } else {
    await registrarLecturaNormal();
  }
});

async function cargarUsuariosParaAdmin() {
  selectAdmin.innerHTML = '<option value="">— Selecciona usuario —</option>';

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(docSnap => {
    // No incluirte a ti
    if (docSnap.id === usuarioActual.uid) return;

    const data = docSnap.data();

    // No incluir admins fijos
    if (data.role === "admin") return;

    const option = document.createElement("option");
    option.value = docSnap.id;

    const nombreReal = data.nombreReal ?? "Sin nombre";
    const personaje = data.nombrePersonaje ?? "Sin personaje";

    option.textContent = `${nombreReal} (${personaje})`;

    selectAdmin.appendChild(option);
  });

  if (selectAdmin.options.length <= 1) {
    alert("⚠️ No hay usuarios disponibles");
    selectAdmin.style.display = "none";
  }
}

function pintarObjetos() {
  const cont = document.getElementById("listaObjetos");
  cont.innerHTML = "";

  if (!usuarioData.objetos || usuarioData.objetos.length === 0) {
    cont.textContent = "No tienes objetos";
    return;
  }

  usuarioData.objetos.forEach(obj => {
    // Icono de ejemplo según objeto
    let icono = "💠";
    if (obj.includes("Anillo")) icono = "💍";
    if (obj.includes("dragon")) icono = "🐉";
    if (obj.includes("Espada")) icono = "🗡️";
    if (obj.includes("Gafas")) icono = "👓";
    if (obj.includes("Tiara")) icono = "👑";
    if (obj.includes("Libro")) icono = "📚";
    if (obj.includes("Armadura")) icono = "🛡️";
    if (obj.includes("Pipa")) icono = "🚬";
    if (obj.includes("Granada")) icono = "🍎";

    // Efecto asociado
    let efecto = "";
    switch(obj) {
      case "El Anillo Único": efecto = "+5 nivel"; break;
      case "Tiara de Donut": efecto = "+25 nivel épico"; break;
      case "Espada de Gandalf": efecto = "+50 prestigio"; break;
      default: efecto = "+XP extra"; break;
    }

    const card = document.createElement("div");
    card.className = "objeto-card";
    card.innerHTML = `
      <span class="icono">${icono}</span>
      <strong>${obj}</strong>
      <small>${efecto}</small>
    `;
    cont.appendChild(card);
  });
}
function aplicarEfectosObjetos() {
  if (!usuarioData.objetos) return;

  // Reset stats base
  usuarioData.nivelBonus = 0;
  usuarioData.prestigioBonus = 0;

  usuarioData.objetos.forEach(obj => {
    switch(obj) {
      case "El Anillo Único":
        usuarioData.nivelBonus += 100;
       // usuarioData.nivelMente -= 100;

        break;
      case "Tiara de Donut":
        usuarioData.nivelBonus += 25; // efecto épico
        break;
      case "Espada de Gandalf":
        usuarioData.prestigioBonus += 50;
        break;
      // añadir los demás objetos según efectos
    }
  });

  // Actualizar stats en la UI
  nivelEl.textContent = usuarioData.nivel + (usuarioData.nivelBonus || 0);
  usuarioPrestigio.textContent = usuarioData.prestigio + (usuarioData.prestigioBonus || 0);
  }

function pintarRetos() {
  const panelActual = document.getElementById("listaRetos");
  panelActual.innerHTML = "";

  // solo el reto actual activo
  lecturasCache
    .filter(l => l.esReto && l.esActual && l.activa)
    .forEach(l => panelActual.appendChild(crearCardLectura(l)));
}

function pintarRetosPendientes() {
  const panelPendientes = document.getElementById("listaRetosPendientes");
  panelPendientes.innerHTML = "";

  // retos activos que NO son el actual
  lecturasCache
    .filter(l => l.esReto && !l.esActual && l.activa)
    .forEach(l => panelPendientes.appendChild(crearCardLectura(l)));
}

function pintarRetosHistoricos() {
  const panelHistorico = document.getElementById("listaRetosHistorico");
  panelHistorico.innerHTML = "";

  // retos completados
  lecturasCache
    .filter(l => l.esReto && !l.activa)
    .forEach(l => panelHistorico.appendChild(crearCardLectura(l)));
}
