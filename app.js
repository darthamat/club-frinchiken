
    // firebase-config.ts or your main application file (continuation)

    // ... (Firebase initialization code from above)

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0",
    authDomain: "club-frinchiken.firebaseapp.com",
    projectId: "club-frinchiken",
    storageBucket: "club-frinchiken.firebasestorage.app",
    messagingSenderId: "993321884320",
    appId: "1:993321884320:web:d4da17ddcc78f0482787c5"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>

    /**
     * Duplicates a Firestore document by copying its data to a new document ID within the same collection.
     * @param collectionPath The path to the collection (e.g., "users").
     * @param sourceDocumentId The ID of the document to duplicate.
     * @param newDocumentId The desired ID for the new duplicated document.
     */
    async function duplicateDocumentWithNewId(collectionPath: string, sourceDocumentId: string, newDocumentId: string) {
      const sourceDocRef = doc(db, collectionPath, sourceDocumentId);
      const newDocRef = doc(db, collectionPath, newDocumentId);

      try {
        const sourceDocSnap = await getDoc(sourceDocRef);

        if (sourceDocSnap.exists()) {
          const documentData = sourceDocSnap.data();
          console.log(`Successfully read data from '${sourceDocumentId}'.`);

          await setDoc(newDocRef, documentData);
          console.log(`Successfully duplicated document '${sourceDocumentId}' to '${newDocumentId}' in collection '${collectionPath}'.`);
        } else {
          console.log(`Source document with ID '${sourceDocumentId}' does not exist in collection '${collectionPath}'.`);
        }
      } catch (error) {
        console.error("Error duplicating document:", error);
      }
    }

    // Now, call the function where you need to duplicate the document.
    // For example, you might call this from a button click handler, or after another event.
    // Make sure to call it inside an async function or handle the Promise.

    // Example of how to call it:
    // This will duplicate 'reto_actual' from 'retos' collection to a new document named 'enero26'
    duplicateDocumentWithNewId("retos", "reto_actual", "enero26")
      .then(() => console.log("Duplication process finished."))
      .catch((error) => console.error("Duplication failed:", error));

    // Or inside an async function:
    /*
    async function performDuplication() {
        await duplicateDocumentWithNewId("retos", "reto_actual", "enero26");
        console.log("Duplication complete.");
    }
    performDuplication();
    */
    ```


// 🔹 Cargar libro del mes dinámicamente
db.collection("libroDelMes").doc("actual").onSnapshot(doc => {
  if(doc.exists){
    const data = doc.data();
    document.getElementById("titulo-libro").textContent = data.titulo;
    document.getElementById("descripcion-libro").textContent = data.descripcion || "";
    document.getElementById("portada-libro").src = `assets/portadas/${data.portada}`;
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
