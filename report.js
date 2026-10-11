import { db, requireLogin, logout, todayISO, showMessage } from "./common.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
requireLogin();document.getElementById("logoutBtn").addEventListener("click",logout);
document.getElementById("toDate").value=todayISO();document.getElementById("fromDate").value=todayISO().slice(0,8)+"01";
let reportData=[];
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function generate(){
 const from=document.getElementById("fromDate").value,to=document.getElementById("toDate").value;
 if(!from||!to||from>to){showMessage("reportMessage","Choose a valid date range.");return;}
 try{
  const [ss,as]=await Promise.all([getDocs(collection(db,"students")),getDocs(query(collection(db,"Attendance"),where("date",">=",from),where("date","<=",to)))]);
  const students=ss.docs.map(d=>({id:d.id,...d.data()}));const records=as.docs.map(d=>d.data());
  reportData=students.map(s=>{const own=records.filter(a=>a.studentId===s.id);const present=own.filter(a=>a.status==="Present").length;const absent=own.filter(a=>a.status==="Absent").length;const total=present+absent;return {id:s.id,name:s.name||"",rollno:s.rollno??s.rollNo??"",total,present,absent,pct:total?Math.round(present/total*100):0};});
  document.getElementById("reportRows").innerHTML=reportData.length?reportData.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.name)}</td><td>${esc(r.rollno)}</td><td>${r.total}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.pct}%</td></tr>`).join(""):'<tr><td colspan="7" class="empty">No students found.</td></tr>';
  document.getElementById("reportMessage").textContent=`Report from ${from} to ${to}. Percentages use days on which attendance was recorded.`;
 }catch(e){console.error(e);showMessage("reportMessage","Could not generate report. Check Firestore Rules.");}
}
document.getElementById("filterBtn").addEventListener("click",generate);
document.getElementById("csvBtn").addEventListener("click",()=>{if(!reportData.length){alert("Generate a report first.");return;}const head=["Student ID","Name","Roll No","Classes marked","Present","Absent","Attendance %"];const lines=[head,...reportData.map(r=>[r.id,r.name,r.rollno,r.total,r.present,r.absent,r.pct+"%"])].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");const url=URL.createObjectURL(new Blob([lines],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="attendance-report.csv";a.click();URL.revokeObjectURL(url);});
generate();
