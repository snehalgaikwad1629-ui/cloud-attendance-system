import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

export { db, auth };
export function requireLogin() {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.replace("index.html");
    else {
      const el = document.getElementById("userEmail");
      if (el) el.textContent = user.email || "Signed in";
    }
  });
}
export async function logout() {
  await signOut(auth);
  window.location.replace("index.html");
}
export function showMessage(id, text, good=false) {
  const el = document.getElementById(id);
  if (el) { el.textContent = text; el.className = good ? "message success" : "message error"; }
}
export function todayISO() {
  const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
