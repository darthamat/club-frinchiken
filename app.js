   
        // 1️⃣ Importamos lo necesario de Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        // 2️⃣ Configuración de Firebase (AHORA hablamos de seguridad 👇)
          const firebaseConfig = {
    apiKey: "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0",
    authDomain: "club-frinchiken.firebaseapp.com",
    projectId: "club-frinchiken",
    storageBucket: "club-frinchiken.firebasestorage.app",
    messagingSenderId: "993321884320",
    appId: "1:993321884320:web:d4da17ddcc78f0482787c5"
  };

        // 3️⃣ Inicializamos Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // 4️⃣ Leemos el libro desde Firestore
        async function cargarLibro() {
            const ref = doc(db, "retos", "2026_01");
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();

                document.getElementById("titulo").textContent = data.Titulo;
                document.getElementById("autor").textContent = "Autor: " + data.Autor;
                document.getElementById("portada").src = data.portadaUrl;
            } else {
                document.getElementById("titulo").textContent = "Libro no encontrado";
            }
        }

        cargarLibro();
 

 