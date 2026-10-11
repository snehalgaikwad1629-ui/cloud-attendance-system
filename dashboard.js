import { db, requireLogin, logout, todayISO } from "./common.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
requireLogin();
document.getElementById("logoutBtn").addEventListener("click", logout);
async function load() {
  try {
    const [studentsSnap, attendanceSnap] = await Promise.all([
      getDocs(collection(db,"students")),
      getDocs(query(collection(db,"Attendance"),where("date","==",todayISO())))
    ]);
    const ids = new Set(attendanceSnap.docs.filter(d=>d.data().status==="Present").map(d=>d.data().studentId));
    document.getElementById("totalStudents").textContent = studentsSnap.size;
    document.getElementById("presentToday").textContent = ids.size;
    document.getElementById("absentToday").textContent = Math.max(0,studentsSnap.size-ids.size);
    document.getElementById("percentageToday").textContent = studentsSnap.size ? `${Math.round(ids.size/studentsSnap.size*100)}%` : "0%";
  } catch(e) { console.error(e); document.getElementById("dashboardMessage").textContent = "Could not load data. Check Firestore Rules and internet connection."; }
}
load();
