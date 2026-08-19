import { useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { getIdToken } from "../services/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

export default function Dashboard({ user }: { user: User }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  async function testAI() {
    if (!message.trim()) return;
    setBusy(true);
    setReply("Thinking...");
    try {
      const token = await getIdToken();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI request failed");
      setReply(data.reply);
    } catch (e: any) {
      setReply(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Redeem Key Logic
  async function redeemPremiumKey(userId: string, key: string) {
    if (!key) return alert("Enter a valid key");
    try {
      const keyRef = doc(db, "keys", key);
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) return alert("Invalid Key");
      if (keySnap.data().status === "USED") return alert("Key already used!");

      const duration = keySnap.data().durationDays;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + duration);

      await updateDoc(doc(db, "users", userId), {
        plan: "PREMIUM",
        dailyLimit: 400,
        expiry: expiryDate.toISOString()
      });

      await updateDoc(keyRef, { status: "USED", redeemedBy: userId });
      alert("Premium Plan Activated! Termux bot is now live.");
      setKeyInput("");
    } catch (error) {
      alert("Error redeeming key.");
    }
  }

  // Generate Key Logic (Admin)
  async function generateKey() {
    const newKey = "RP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    await setDoc(doc(db, "keys", newKey), {
      durationDays: 30,
      status: "UNUSED",
      createdAt: new Date().toISOString()
    });
    alert(`Key Generated: ${newKey}\nCopy and send this to your client.`);
  }

  return (
    <div className="shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>ReplyPilot AI</h2>
        <button className="secondary" onClick={() => signOut(auth)}>Logout</button>
      </header>

      <div className="row" style={{ marginBottom: '20px' }}>
        <button className={activeTab === "chat" ? "" : "secondary"} onClick={() => setActiveTab("chat")}>
          Dashboard & AI Test
        </button>
        <button className={activeTab === "settings" ? "" : "secondary"} onClick={() => setActiveTab("settings")}>
          Bot Settings & Platforms
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          <section className="card" style={{ marginBottom: '20px' }}>
            <h3>Account & Premium Status</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> <span style={{ fontSize: '12px', opacity: 0.7 }}>{user.uid}</span></p>
            
            <div style={{ background: '#0d1427', padding: '15px', borderRadius: '12px', marginTop: '15px' }}>
              <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Redeem Premium Key</label>
              <div className="row">
                <input 
                  placeholder="e.g. RP-X92M" 
                  value={keyInput} 
                  onChange={(e) => setKeyInput(e.target.value)} 
                  style={{ flex: 1 }}
                />
                <button onClick={() => redeemPremiumKey(user.uid, keyInput)}>Activate</button>
              </div>
            </div>

            <button className="secondary" onClick={generateKey} style={{ marginTop: '15px' }}>
              👑 Admin: Generate 30-Day Key
            </button>
          </section>

          <section className="card">
            <h3>AI Test Chat</h3>
            <textarea
              placeholder="Example: Bhai price kya hai?"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button onClick={testAI} disabled={busy || !message.trim()}>Send Test Message</button>
            {reply && <div className="reply">{reply}</div>}
          </section>
        </>
      ) : (
        <>
          <section className="card" style={{ marginBottom: '20px' }}>
            <h3>Bot Settings</h3>
            <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Business Name</label>
            <input placeholder="e.g., Trade Kingdom" />
            <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Custom AI Instructions</label>
            <textarea placeholder="e.g., Always reply in Hinglish. Be polite." style={{ minHeight: '80px' }} />
            <button>Save Settings</button>
          </section>
        </>
      )}
    </div>
  );
}
