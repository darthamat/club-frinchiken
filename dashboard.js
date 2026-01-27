import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Config
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

// Elementos DOM
const nombreUsuario = document.getElementById("nombreUsuario");
const claseUsuario = document.getElementById("claseUsuario");
const nivelUsuario = document.getElementById("nivelUsuario");
const prestigioUsuario = document.getElementById("prestigioUsuario");
const progresoNivel = document.getElementById("progresoNivel");
const avatarClase = document.getElementById("avatarClase");
const btnLogout = document.getElementById("btnLogout");

// Reto
const tituloReto = document.getElementById("tituloReto");
const autorReto = document.getElementById("autorReto");
const portadaReto = document.getElementById("portadaReto");
const btnRegistrarReto = document.getElementById("btnRegistrarReto");

// Registro lecturas
const busquedaLibro = document.getElementById("busquedaLibro");
const resultados = document.getElementById("resultados");
const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const paginasInput = document.getElementById("paginas");
const categoriaInput = document.getElementById("categoria");
const portadaImg = document.querySelector(".libro-seleccionado img");
const btnRegistrar = document.getElementById("btnRegistrar");

// Logros
const logrosContainer = document.getElementById("logrosContainer");

// Avatar colores por clase
const colorClase = {
  "Mago Enteraíllo":"#8e44ad","Bardo Cuentacuentos":"#e67e22",
  "Caballero de las Palabras":"#3498db","Pícaro de los Post-it":"#f1c40f",
  "Druida de Marcapáginas":"#27ae60","Arquitecto de Tramas":"#c0392b",
  "Explorador de Bibliotecas":"#16a085","Alquimista de Historias":"#d35400",
  "Guardabibliotecas":"#2c3e50","Oráculo de Sinopsis":"#9b59b6",
  "Hechicero de Títulos Largos":"#e74c3c","Viajero de Mundos Paralelos":"#1abc9c",
  "Señor/a de las Comillas":"#34495e","Monje de los Ensayos":"#7f8c8d",
  "Ninja de las Notas al Pie":"#95a5a6","Gladiador de las Páginas":"#f39c12",
  "Cazador de Spoilers":"#d35400","Pirata de Bibliotecas":"#8e44ad",
  "Arquero de la Lectura":"#2980b9","Alquimista de Café y Libros":"#c0392b"
};

// ---------------- SESIÓN ----------------
let usuarioActual = null;

onAuthStateChanged(auth, async(user)=>{
  if(user){
    usuarioActual = user;
    const userRef = doc(db,"users",user.uid);
    const snap = await getDoc(userRef);
    if(snap.exists()){
      const data = snap.data();
      nombreUsuario.textContent = user.displayName || data.displayName;
      claseUsuario.textContent = data.clase || "Aventurero Literario";
      nivelUsuario.textContent = data.nivel || 1;
      prestigioUsuario.textContent = data.prestigio || 0;
      progresoNivel.style.width = ((data.prestigio % 100)/100*100) + "%";
      avatarClase.style.background = colorClase[data.clase] || "#ccc";
      cargarRetoActual();
      cargarLogros();
    }
  }else{
    window.location.href = "login.html";
  }
});

// Logout
btnLogout.addEventListener("click", async()=>{
  await signOut(auth);
  window.location.href = "login.html";
});

// ---------------- RETO ACTUAL ----------------
async function cargarRetoActual(){
  const retoRef = doc(db,"retos","2026_01");
  const snap = await getDoc(retoRef);
  if(snap.exists()){
    const reto = snap.data();
    tituloReto.textContent = reto.Titulo;
    autorReto.textContent = reto.Autor;
    portadaReto.src = reto.portadaUrl;
  } else {
    tituloReto.textContent = "No hay reto activo";
  }
}

// Registrar progreso del reto
btnRegistrarReto.addEventListener("click", async()=>{
  if(!usuarioActual) return;
  const retoRef = doc(db,"retos","2026_01");
  const snap = await getDoc(retoRef);
  if(!snap.exists()) return;
  const reto = snap.data();

  const lecturasRef = collection(db,"users",usuarioActual.uid,"lecturas");
  await addDoc(lecturasRef,{
    titulo: reto.Titulo,
    autor: reto.Autor,
    paginas: reto.paginas || 0,
    categoria: reto.categoria || "Fantasía",
    portada: reto.portadaUrl || "",
    tipo:"reto",
    estado:"terminado",
    fechaInicio: Timestamp.now(),
    fechaFin: Timestamp.now(),
    prestigioOtorgado: reto.paginas || 0,
    botinGenerado:false
  });

  alert(`📘 Lectura del reto registrada! Prestigio +${reto.paginas}`);
  // Actualizar prestigo
  actualizarPrestigio(reto.paginas);
});

// ---------------- REGISTRO DE LECTURAS ----------------
btnRegistrar.addEventListener("click", async()=>{
  if(!usuarioActual) return;
  const titulo = tituloInput.value.trim();
  const autor = autorInput.value.trim();
  const paginas = parseInt(paginasInput.value);
  const categoria = categoriaInput.value;
  const portada = portadaImg.src;

  if(!titulo || !autor || !paginas){
    alert("Completa los campos obligatorios");
    return;
  }

  const lecturasRef = collection(db,"users",usuarioActual.uid,"lecturas");
  await addDoc(lecturasRef,{
    titulo,
    autor,
    paginas,
    categoria,
    portada,
    tipo:"libre",
    estado:"terminado",
    fechaInicio: Timestamp.now(),
    fechaFin: Timestamp.now(),
    prestigioOtorgado: paginas,
    botinGenerado:false
  });

  alert(`📘 Lectura registrada! Prestigio +${paginas}`);
  actualizarPrestigio(paginas);
  cargarLogros();
});

// ---------------- FUNCIONES AUX ----------------
async function actualizarPrestigio(cantidad){
  const userRef = doc(db,"users",usuarioActual.uid);
  const snap = await getDoc(userRef);
  if(snap.exists()){
    const data = snap.data();
    const nuevoPrestigio = (data.prestigio||0) + cantidad;
    let nuevoNivel = data.nivel||1;
    // Subir nivel cada 100 prestigio
    while(nuevoPrestigio >= nuevoNivel*100){
      nuevoNivel++;
    }
    await userRef.update({prestigio: nuevoPrestigio, nivel:nuevoNivel});
    prestigioUsuario.textContent = nuevoPrestigio;
    nivelUsuario.textContent = nuevoNivel;
    progresoNivel.style.width = ((nuevoPrestigio % 100)/100*100) + "%";
  }
}

// ---------------- LOGROS ----------------
async function cargarLogros(){
  logrosContainer.innerHTML = "";
  const lecturasRef = collection(db,"users",usuarioActual.uid,"lecturas");
  const snap = await getDoc(doc(db,"users",usuarioActual.uid));
  if(snap.exists()){
    const data = snap.data();
    const lecturas = data.lecturas || [];
    lecturas.forEach(l => {
      const div = document.createElement("div");
      div.classList.add("logro");
      div.textContent = `📖 ${l.titulo} (${l.paginas} pág)`;
      logrosContainer.appendChild(div);
    });
  }
}

// Botín RPG
const objetos = {
  normales: ["Marcapáginas de cuero", "Taza de café mágica", "Lápiz encantado"],
  raros: ["Pluma de dragón", "Amuleto del lector nocturno", "Libro antiguo dorado"],
  legendarios: ["Grimorio del Conocimiento Supremo", "Espada de Palabras", "Anillo de Tramas Infinitas"]
};

// Probabilidad de drop
const probabilidad = {
  legendario: 0.05, // 5%
  raro: 0.15,       // 15%
  normal: 0.8       // 80%
};

function generarBotin(){
  const rand = Math.random();
  let tipo;
  if(rand <= probabilidad.legendario) tipo = "legendario";
  else if(rand <= probabilidad.legendario + probabilidad.raro) tipo = "raro";
  else tipo = "normal";

  const lista = objetos[tipo];
  const item = lista[Math.floor(Math.random() * lista.length)];

  return { tipo, item };
}

btnRegistrar.addEventListener("click", async()=>{
  if(!usuarioActual) return;
  const titulo = tituloInput.value.trim();
  const autor = autorInput.value.trim();
  const paginas = parseInt(paginasInput.value);
  const categoria = categoriaInput.value;
  const portada = portadaImg.src;

  if(!titulo || !autor || !paginas){
    alert("Completa los campos obligatorios");
    return;
  }

  // Generar botín
  const botin = generarBotin();

  const lecturasRef = collection(db,"users",usuarioActual.uid,"lecturas");
  await addDoc(lecturasRef,{
    titulo,
    autor,
    paginas,
    categoria,
    portada,
    tipo:"libre",
    estado:"terminado",
    fechaInicio: Timestamp.now(),
    fechaFin: Timestamp.now(),
    prestigioOtorgado: paginas,
    botinGenerado: true,
    botin
  });

  alert(`📘 Lectura registrada! Prestigio +${paginas} y has conseguido: ${botin.item} (${botin.tipo})`);
  actualizarPrestigio(paginas);
  cargarLogros();
});

btnRegistrarReto.addEventListener("click", async()=>{
  if(!usuarioActual) return;
  const retoRef = doc(db,"retos","2026_01");
  const snap = await getDoc(retoRef);
  if(!snap.exists()) return;
  const reto = snap.data();

  // Generar botín
  const botin = generarBotin();

  const lecturasRef = collection(db,"users",usuarioActual.uid,"lecturas");
  await addDoc(lecturasRef,{
    titulo: reto.Titulo,
    autor: reto.Autor,
    paginas: reto.paginas || 0,
    categoria: reto.categoria || "Fantasía",
    portada: reto.portadaUrl || "",
    tipo:"reto",
    estado:"terminado",
    fechaInicio: Timestamp.now(),
    fechaFin: Timestamp.now(),
    prestigioOtorgado: reto.paginas || 0,
    botinGenerado:true,
    botin
  });

  alert(`📘 Lectura del reto registrada! Prestigio +${reto.paginas} y has conseguido: ${botin.item} (${botin.tipo})`);
  actualizarPrestigio(reto.paginas);
  cargarLogros();
});
async function cargarLogros(){
  logrosContainer.innerHTML = "";
  const lecturasRef = collection(db,"users",usuarioActual.uid,"lecturas");
  const snap = await getDoc(doc(db,"users",usuarioActual.uid));
  if(snap.exists()){
    const data = snap.data();
    const lecturas = data.lecturas || [];
    lecturas.forEach(l => {
      const div = document.createElement("div");
      div.classList.add("logro");
      let texto = `📖 ${l.titulo} (${l.paginas} pág)`;
      if(l.botinGenerado && l.botin) {
        texto += ` - 🎁 ${l.botin.item} (${l.botin.tipo})`;
      }
      div.textContent = texto;
      logrosContainer.appendChild(div);
    });
  }
}
