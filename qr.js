import { requireLogin, logout, todayISO, showMessage } from "./common.js";
requireLogin(); document.getElementById("logoutBtn").addEventListener("click", logout);
const day=todayISO(); document.getElementById("sessionDate").textContent=day;
document.getElementById("generateBtn").addEventListener("click",()=>{
 const box=document.getElementById("qrcode"); box.innerHTML="";
 if(!window.QRCode){showMessage("qrMessage","QR library could not load. Check your internet connection.");return;}
 const payload=JSON.stringify({type:"attendance-session",date:day,project:"cloudattendance-system"});
 new QRCode(box,{text:payload,width:220,height:220});
 showMessage("qrMessage","QR code generated for "+day+". Scan it from the Scan QR page.",true);
});
