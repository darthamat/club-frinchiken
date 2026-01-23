import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function duplicarRetoActual(nuevoId) {
  const refActual = doc(db, "retos", "reto_actual");
  const snap = await getDoc(refActual);

  if (!snap.exists()) {
    alert("No existe reto_actual");
    return;
  }

  await setDoc(
    doc(db, "retos", nuevoId),
    snap.data()
  );

  alert("Reto duplicado como " + nuevoId);
}