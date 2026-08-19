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

  // Admin Variables
  const isAdmin = user.email === "oomg20330@gmail.com"; // SUPER ADMIN LOCK
  const [customDays, setCustomDays] = useState(30);
  const [msgLimit, setMsgLimit] = useState(400);
  const [maxDevices, setMaxDevices] = useState(1);

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
      setReply(`Backend Error. Check API folder.`);
    } finally {
      setBusy(false);
    }
  }

  // Customer: Redeem Key
  async function redeemPremiumKey(userId: string, key: string) {
    if (!key) return alert("Enter a valid key");
    try {
      const keyRef = doc(db, "keys", key);
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) return alert("Invalid Key");
      if (keySnap.data().status === "USED") return alert("Key already used!");

      const duration = keySnap.data().durationDays;
      const limit = keySnap.data().msgLimit;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + duration);

      await updateDoc(doc(db, "users", userId), {
        plan: "PREMIUM",
        dailyLimit: limit,
        expiry: expiryDate.toISOString()
      });

      await updateDoc(keyRef, { status: "USED", redeemedBy: userId });
      alert("Premium Plan Activated! Setup your Bot Settings now.");
      setKeyInput("");
    } catch (error) {
      alert("Error redeeming key.");
    }
  }

  // Admin: Advanced Key Generation
  async function generateCustomKey() {
    const newKey = "RP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    await setDoc(doc(db, "keys", newKey), {
      durationDays: Number(customDays),
      msgLimit: Number(msgLimit),
      maxDevices: Number(maxDevices),
      status: "UNUSED",
      createdAt: new Date().toISOString()
    });
    alert(`Key Generated: ${newKey}\nDays: ${customDays} | Msgs: ${msgLimit}/day`);
  }

  return (
    <div className="shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>ReplyPilot AI</h2>
        <button className="secondary" onClick={() => signOut(auth)}>Logout</button>
      </header>

      {/* Navigation Tabs */}
      <div className="row" style={{ marginBottom: '20px' }}>
        <button className={activeTab === "chat" ? "" : "secondary"} onClick={() => setActiveTab("chat")}>
          Dashboard
        </button>
        <button className={activeTab === "settings" ? "" : "secondary"} onClick={() => setActiveTab("settings")}>
          Bot Settings
        </button>
        
        {/* Hidden Admin Tab - Only visible to oomg20330@gmail.com */}
        {isAdmin && (
          <button className={activeTab === "admin" ? "" : "secondary"} onClick={() => setActiveTab("admin")} style={{ border: '1px solid #ff4b4b', color: '#ff4b4b' }}>
            👑 Admin Panel
          </button>
        )}
      </div>

      {activeTab === "chat" && (
        <>
          <section className="card" style={{ marginBottom: '20px' }}>
            <h3>Account & Premium Status</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> <span style={{ fontSize: '12px', opacity: 0.7 }}>{user.uid}</span></p>
            
            <div style={{ background: '#0d1427', padding: '15px', borderRadius: '12px', marginTop: '15px' }}>
              <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Redeem Premium Key</label>
              <div className="row">
                <input placeholder="e.g. RP-X92M" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} style={{ flex: 1 }} />
                <button onClick={() => redeemPremiumKey(user.uid, keyInput)}>Activate</button>
              </div>
            </div>
          </section>

          <section className="card">
            <h3>AI Test Chat</h3>
            <textarea placeholder="Example: Bhai price kya hai?" value={message} onChange={e => setMessage(e.target.value)} />
            <button onClick={testAI} disabled={busy || !message.trim()}>Send Test Message</button>
            {reply && <div className="reply">{reply}</div>}
          </section>
        </>
      )}

      {activeTab === "settings" && (
        <section className="card">
          <h3>WhatsApp Bot Setup</h3>
          
          <label style={{ fontSize: '14px', color: '#aeb7d0' }}>WhatsApp Number (Format: 91XXXXXXXXXX)</label>
          <input placeholder="e.g., 919876543210" style={{ marginBottom: '15px' }} />

          <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Business Name</label>
          <input placeholder="e.g., Trade Kingdom" style={{ marginBottom: '15px' }} />
          
          <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Custom AI Instructions (Rules, Shop Address, Prices)</label>
          <textarea placeholder="e.g., Always reply in Hinglish. No Cash on Delivery. Address is Main Market." style={{ minHeight: '100px', marginBottom: '15px' }} />
          
          <button>Save Settings</button>
        </section>
      )}

      {/* ADMIN PANEL UI */}
      {activeTab === "admin" && isAdmin && (
        <section className="card" style={{ border: '1px solid #ff4b4b' }}>
          <h3 style={{ color: '#ff4b4b' }}>Super Admin: Key Generator</h3>
          
          <div className="row" style={{ marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px' }}>Validity (Days)</label>
              <input type="number" value={customDays} onChange={e => setCustomDays(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px' }}>Daily Msgs Limit</label>
              <input type="number" value={msgLimit} onChange={e => setMsgLimit(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px' }}>Max Devices/Accounts</label>
              <input type="number" value={maxDevices} onChange={e => setMaxDevices(e.target.value)} />
            </div>
          </div>
          
          <button onClick={generateCustomKey} style={{ background: '#ff4b4b', color: '#fff', width: '100%' }}>
            Generate Custom Key
          </button>
        </section>
      )}
    </div>
  );
}
