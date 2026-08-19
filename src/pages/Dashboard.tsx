// Dashboard.tsx (Add these inside your existing Dashboard component)
import { useState } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// 1. Admin Function: Generate a 30-Day Key
async function generatePremiumKey() {
  const newKey = "RP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Save to 'keys' collection in Firestore
  await setDoc(doc(db, "keys", newKey), {
    durationDays: 30,
    status: "UNUSED",
    createdAt: new Date().toISOString()
  });
  alert(`Key Generated: ${newKey}\nCopy and send this to your client.`);
}

// 2. Client Function: Redeem the Key
async function redeemKey(userId, keyInput) {
  if (!keyInput) return alert("Enter a valid key");
  
  const keyRef = doc(db, "keys", keyInput);
  const keySnap = await getDoc(keyRef);

  if (!keySnap.exists()) return alert("Invalid Key");
  if (keySnap.data().status === "USED") return alert("Key already used!");

  // Calculate Expiry Date (Current Date + 30 Days)
  const duration = keySnap.data().durationDays;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + duration);

  // Update User Profile
  await updateDoc(doc(db, "users", userId), {
    plan: "PREMIUM",
    dailyLimit: 400, // Premium limit
    expiry: expiryDate.toISOString() // Sets the exact expiry time
  });

  // Mark Key as Used
  await updateDoc(keyRef, { status: "USED", redeemedBy: userId });
  alert("Premium Plan Activated! Termux bot is now live.");
}
