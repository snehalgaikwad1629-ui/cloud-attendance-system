
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  where,
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

onAuthStateChanged(auth, async (user) => {
  tapButton.disabled = true;
  currentStudent = null;

  if (!user) {
    message.textContent = "Please log in first.";
    studentName.textContent = "Not logged in";
    cardStatus.textContent = "Card unavailable";
    return;
  }

  try {
    // Find the student linked to this login email.
    const studentsRef = collection(db, "students");
    const emailQuery = query(
      studentsRef,
      where("email", "==", user.email)
    );
    const result = await getDocs(emailQuery);

    if (result.empty) {
      studentName.textContent = user.displayName || "Student";
      studentId.textContent = "Student ID: Not linked";
      cardStatus.textContent = "Card not configured";
      message.textContent =
        "Admin must link this login to a student record first.";
      return;
    }

    const studentDoc = result.docs[0];
    currentStudent = {
      id: studentDoc.id,
      ...studentDoc.data()
    };

    studentName.textContent = currentStudent.name || "Student";
    studentId.textContent = "Student ID: " + studentDoc.id;
    cardStatus.textContent = "Digital card active";
    tapButton.disabled = false;
    message.textContent = "Ready to mark attendance.";

  } catch (error) {
    console.error(error);
    message.textContent =
      "Could not load card. Check Firestore rules and student setup.";
  }
});

tapButton.addEventListener("click", async () => {
  if (!auth.currentUser || !currentStudent) {
    message.textContent = "Please log in and load your card first.";
    return;
  }

  tapButton.disabled = true;

  try {
    const today = new Date().toLocaleDateString("en-CA");
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
    console.error(error);
    message.textContent =
      "Attendance failed. Check Firestore rules.";
  } finally {
    tapButton.disabled = false;
  }
});
