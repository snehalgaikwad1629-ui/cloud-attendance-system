import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("message");
onAuthStateChanged(auth, user => { if (user) window.location.replace("dashboard.html"); });
form.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "Signing in…"; message.className = "message";
  try {
    await signInWithEmailAndPassword(auth, document.getElementById("email").value.trim(), document.getElementById("password").value);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    message.className = "message error";
    message.textContent = error.code === "auth/invalid-credential" ? "Email or password is incorrect." : `Login failed: ${error.code || "Please try again."}`;
  }
});
