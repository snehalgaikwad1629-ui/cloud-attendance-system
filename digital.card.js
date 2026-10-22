```javascript
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const studentName = document.getElementById("studentName");
const studentId = document.getElementById("studentId");
const cardStatus = document.getElementById("cardStatus");
const tapButton = document.getElementById("tapButton");
const message = document.getElementById("message");

let currentStudent = null;

function showError(error) {
  console.error("Digital Card error:", error);
  message.textContent =
    "Could not load card. Please check Firebase setup and Firestore rules.";
}

onAuthStateChanged(auth, async (user) => {
  tapButton.disabled = true;
  currentStudent = null;

  studentName.textContent = "Checking student...";
  studentId.textContent = "Student ID: —";
  cardStatus.textContent = "Checking card status...";
  message.textContent = "";

  if (!user) {
    studentName.textContent = "Not logged in";
    cardStatus.textContent = "Card unavailable";
    message.textContent = "Please log in first, then open this card.";
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "students"));

    // Only link by email if a student record explicitly contains
    // the same email as the authenticated account.
    const matchedDoc = snapshot.docs.find((item) => {
      const data = item.data();
      return (
        typeof data.email === "string" &&
        data.email.toLowerCase() === user.email?.toLowerCase()
      );
    });

    if (!matchedDoc) {
      studentName.textContent = user.displayName || "Student";
      studentId.textContent = "Student ID: Not linked";
      cardStatus.textContent = "Card not configured";
      message.textContent =
        "No student record is linked to this login email. Ask the admin to link the correct student.";
      return;
    }

    const data = matchedDoc.data();

    if (data.cardEnabled === false) {
      studentName.textContent = data.name || "Student";
      studentId.textContent = "Student ID: " + matchedDoc.id;
      cardStatus.textContent = "Card disabled";
      message.textContent = "This digital card is disabled.";
      return;
    }

    currentStudent = {
      id: matchedDoc.id,
      name: data.name || "Student"
    };

    studentName.textContent = currentStudent.name;
    studentId.textContent = "Student ID: " + currentStudent.id;
    cardStatus.textContent = "Digital card active";
    tapButton.disabled = false;
    message.textContent = "Ready to mark attendance.";

  } catch (error) {
    showError(error);
    studentName.textContent = "Unable to load student";
    cardStatus.textContent = "Card unavailable";
  }
});

tapButton.addEventListener("click", async () => {
  if (!auth.currentUser || !currentStudent) {
    message.textContent = "Please log in and load your card first.";
    return;
  }

  tapButton.disabled = true;

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const attendanceId = `${today}_${currentStudent.id}`;
    const attendanceRef = doc(db, "Attendance", attendanceId);
    const existing = await getDoc(attendanceRef);

    if (existing.exists()) {
      message.textContent = "Attendance already marked for today.";
      return;
    }

    await setDoc(attendanceRef, {
      studentId: currentStudent.id,
      date: today,
      status: "Present",
      updatedAt: serverTimestamp()
    });

    message.textContent = "Attendance marked successfully!";

  } catch (error) {
    showError(error);
  } finally {
    tapButton.disabled = false;
  }
});
```
