// Configuración Firebase
   const firebaseConfig = {
    apiKey: "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0",
    authDomain: "club-frinchiken.firebaseapp.com",
    projectId: "club-frinchiken",
    storageBucket: "club-frinchiken.firebasestorage.app",
    messagingSenderId: "993321884320",
    appId: "1:993321884320:web:d4da17ddcc78f0482787c5"
  };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔹 Cargar libro del mes dinámicamente
db.collection("retos").doc("2026_01").onSnapshot(doc => {
  if(doc.exists){
    const data = doc.data();
    document.getElementById("titulo-libro").textContent = data.Titulo;
    document.getElementById("Autor-libro").textContent = data.Autor || "";
    document.getElementById("portada-libro").src = `assets/portadas/${data.portadaUrl}`;
  }
});

// 🔹 Cargar ranking
async function mostrarRanking() {
  const snapshot = await db.collection("usuarios").orderBy("nivel","desc").get();
  const ranking = document.getElementById("ranking");
  ranking.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement("li");
    const expPercent = Math.min((data.experiencia % 100), 100);
    li.innerHTML = `${data.nombre} - Nivel ${data.nivel} 
                    <div class="barra-exp"><div class="barra" style="width:${expPercent}%;"></div></div>`;
    ranking.appendChild(li);
  });
}
mostrarRanking();

// 🔹 Cargar hoja de personaje
document.getElementById("cargar-personaje").addEventListener("click", async () => {
  const id = document.getElementById("usuario-id").value.trim();
  if(!id) return alert("Introduce tu ID de usuario");
  const doc = await db.collection("usuarios").doc(id).get();
  if(!doc.exists) return alert("Usuario no encontrado");

  const u = doc.data();
  document.getElementById("hoja-personaje").style.display = "block";
  document.getElementById("nombre-user").textContent = u.nombre;
  document.getElementById("nivel-user").textContent = u.nivel;
  document.getElementById("exp-user").textContent = u.experiencia;
  document.getElementById("clase-user").textContent = u.hojaPersonaje.clase;
  document.getElementById("fuerza-user").textContent = u.hojaPersonaje.fuerza;
  document.getElementById("inteligencia-user").textContent = u.hojaPersonaje.inteligencia;
  document.getElementById("carisma-user").textContent = u.hojaPersonaje.carisma;
  document.getElementById("barra-exp").style.width = `${Math.min(u.experiencia%100,100)}%`;
});

// 🔹 Marcar libro como leído y subir experiencia
document.getElementById("marcar-leido").addEventListener("click", async () => {
  const id = document.getElementById("usuario-id").value.trim();
  const ref = db.collection("usuarios").doc(id);
  const doc = await ref.get();
  if(!doc.exists) return alert("Usuario no encontrado");

  let exp = doc.data().experiencia + 50;
  let nivel = Math.floor(exp/100)+1;

  await ref.update({ experiencia: exp, nivel: nivel });
  alert(`¡Libro marcado! Nivel: ${nivel}, Experiencia: ${exp}`);
  mostrarRanking();
});
