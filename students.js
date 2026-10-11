import { db, requireLogin, logout, showMessage } from "./common.js";
import { collection, getDocs, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
requireLogin(); document.getElementById("logoutBtn").addEventListener("click",logout);
let students=[];
async function load() {
 try {
  const snap=await getDocs(collection(db,"students"));
  students=snap.docs.map(d=>({id:d.id,...d.data()})); render();
 } catch(e){console.error(e);showMessage("studentMessage","Could not read students. Check Firestore Rules.");}
}
function render(){
 const term=document.getElementById("search").value.toLowerCase();
 const rows=students.filter(s=>[s.id,s.name,s.rollno,s.rollNo].some(v=>String(v||"").toLowerCase().includes(term)));
 document.getElementById("studentRows").innerHTML=rows.length?rows.map(s=>`<tr><td>${esc(s.id)}</td><td>${esc(s.name||"")}</td><td>${esc(s.rollno??s.rollNo??"")}</td><td><button class="danger" data-delete="${esc(s.id)}">Delete</button></td></tr>`).join(""):'<tr><td colspan="4" class="empty">No students found.</td></tr>';
 document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",async()=>{if(confirm(`Delete student ${b.dataset.delete}?`)){try{await deleteDoc(doc(db,"students",b.dataset.delete));await load()}catch(e){alert("Delete failed. Check Firestore Rules.")}}}));
}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.getElementById("search").addEventListener("input",render);
document.getElementById("studentForm").addEventListener("submit",async e=>{
 e.preventDefault();const id=document.getElementById("studentId").value.trim();const name=document.getElementById("studentName").value.trim();const rollno=document.getElementById("rollNo").value.trim();
 try{await setDoc(doc(db,"students",id),{name,rollno,createdAt:new Date().toISOString()});e.target.reset();showMessage("studentMessage","Student saved successfully.",true);await load();}
 catch(err){console.error(err);showMessage("studentMessage","Save failed. Check Firestore Rules.");}
});
load();
