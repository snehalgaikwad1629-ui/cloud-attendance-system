import { db, requireLogin, logout, todayISO, showMessage } from "./common.js";
import { collection, getDocs, query, where, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
requireLogin();document.getElementById("logoutBtn").addEventListener("click",logout);
const dateInput=document.getElementById("date");dateInput.value=todayISO();let students=[];
async function load(){try{const snap=await getDocs(collection(db,"students"));students=snap.docs.map(d=>({id:d.id,...d.data()}));await render();if(!students.length)showMessage("attendanceMessage","No students yet. Add students on the Students page.");}catch(e){console.error(e);showMessage("attendanceMessage","Could not load students. Check Firestore Rules.");}}
async function render(){
 const day=dateInput.value||todayISO();let saved={};
 try{const snap=await getDocs(query(collection(db,"Attendance"),where("date","==",day)));snap.docs.forEach(d=>{const a=d.data();saved[a.studentId]=a.status;});}catch(e){console.error(e);}
 document.getElementById("attendanceRows").innerHTML=students.length?students.map(s=>`<tr><td>${esc(s.id)}</td><td>${esc(s.name||"")}</td><td>${esc(s.rollno??s.rollNo??"")}</td><td><select data-student="${esc(s.id)}"><option ${saved[s.id]==="Present"?"selected":""}>Present</option><option ${saved[s.id]==="Absent"?"selected":""}>Absent</option></select></td></tr>`).join(""):'<tr><td colspan="4" class="empty">No students. Add students first.</td></tr>';
}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.getElementById("loadBtn").addEventListener("click",render);dateInput.addEventListener("change",render);
document.getElementById("saveBtn").addEventListener("click",async()=>{
 const day=dateInput.value;if(!day){showMessage("attendanceMessage","Please choose a date.");return;}
 try{const selects=[...document.querySelectorAll("[data-student]")];for(const sel of selects){const studentId=sel.dataset.student;await setDoc(doc(db,"Attendance",`${day}_${studentId}`),{studentId,date:day,status:sel.value,updatedAt:new Date().toISOString()});}showMessage("attendanceMessage","Attendance saved successfully.",true);}
 catch(e){console.error(e);showMessage("attendanceMessage","Save failed. Check Firestore Rules.");}
});
load();
