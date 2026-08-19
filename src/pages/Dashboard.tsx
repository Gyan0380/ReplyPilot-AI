import { useState, useEffect } from "react";
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

  // User Plan & Stats Variables
  const [plan, setPlan] = useState("FREE");
  const [expiry, setExpiry] = useState("");
  const [dailyLimit, setDailyLimit] = useState(20);
  const [msgsUsed, setMsgsUsed] = useState(0);
  const [botActive, setBotActive] = useState(false);

  // Bot Settings Variables
  const [waNumber, setWaNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const isAdmin = user.email === "oomg20330@gmail.com"; 
  const [customDays, setCustomDays] = useState<number | string>(30);
  const [msgLimit, setMsgLimit] = useState<number | string>(400);
  const [maxDevices, setMaxDevices] = useState<number | string>(1);

  // Load User Data & Settings from Firebase
  useEffect(() => {
    async function loadSettings() {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setPlan(data.plan || "FREE");
        setExpiry(data.expiry || "");
        setDailyLimit(data.dailyLimit || 20);
        setMsgsUsed(data.msgsUsed || 0);
        setBotActive(data.botActive || false);

        if (data.botSettings) {
          setWaNumber(data.botSettings.waNumber || "");
          setBusinessName(data.botSettings.businessName || "");
          setAiInstructions(data.botSettings.aiInstructions || "");
        }
      }
    }
    loadSettings();
  }, [user.uid]);

  // Toggle Bot ON/OFF
  async function toggleBotStatus() {
    const newState = !botActive;
    setBotActive(newState);
    try {
      await setDoc(doc(db, "users", user.uid), { botActive: newState }, { merge: true });
    } catch (e) {
      alert("Error changing bot status.");
      setBotActive(!newState); // Revert on error
    }
  }

  // Save Settings Function
  async function saveBotSettings() {
    if (!waNumber || !businessName || !aiInstructions) {
      return alert("Please fill all fields before saving.");
    }
    setSavingSettings(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        botSettings: {
          waNumber,
          businessName,
          aiInstructions
        }
      }, { merge: true });
      alert("Bot settings saved successfully!");
    } catch (error) {
      alert("Error saving settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  // AI Test Function
  async function testAI() {
    if (!message.trim()) return;
    setBusy(true);
    setReply("Thinking...");
    try {
      const token = await getIdToken();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI request failed");
      setReply(data.reply);
    } catch (e: any) {
      setReply(`Backend Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Key Redemption Logic
  async function redeemPremiumKey(userId: string, key: string) {
    if (!key) return alert("Enter a valid key");
    try {
      const keyRef = doc(db, "keys", key);
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) return alert("Invalid Key");
      if (keySnap.data().status === "USED") return alert("Key already used!");

      const data = keySnap.data();
      const duration = Number(data.durationDays) || 30;
      const limit = Number(data.msgLimit) || 400; 
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + duration);

      await setDoc(doc(db, "users", userId), {
        plan: "PREMIUM",
        dailyLimit: limit,
        expiry: expiryDate.toISOString(),
        msgsUsed: 0, // Reset usage on new key
        botActive: false // Default to false until user turns it on
      }, { merge: true });

      await updateDoc(keyRef, { status: "USED", redeemedBy: userId });
      alert("Premium Activated! Setup Bot Settings now.");
      setKeyInput("");
      window.location.reload(); // Reload to fetch new plan status
    } catch (error: any) {
      alert("Error redeeming key.");
    }
  }

  // Admin Key Generation
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

      {/* Tabs */}
      <div className="row" style={{ marginBottom: '20px' }}>
        <button className={activeTab === "chat" ? "" : "secondary"} onClick={() => setActiveTab("chat")}>Dashboard</button>
        <button className={activeTab === "settings" ? "" : "secondary"} onClick={() => setActiveTab("settings")}>Bot Settings</button>
        {isAdmin && (
          <button className={activeTab === "admin" ? "" : "secondary"} onClick={() => setActiveTab("admin")} style={{ border: '1px solid #ff4b4b', color: '#ff4b4b' }}>
            👑 Admin Panel
          </button>
        )}
      </div>

      {activeTab === "chat" && (
        <>
          <section className="card" style={{ marginBottom: '20px' }}>
            <h3>Account Status</h3>
            <p><strong>Plan:</strong> <span style={{ color: plan === 'PREMIUM' ? '#00e676' : '#aeb7d0', fontWeight: 'bold' }}>{plan}</span></p>
            {plan === "PREMIUM" && expiry && (
              <p><strong>Expires On:</strong> {new Date(expiry).toLocaleDateString()}</p>
            )}
            
            {/* Stats UI */}
            {plan === "PREMIUM" && (
              <div style={{ background: '#0d1427', padding: '15px', borderRadius: '12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#aeb7d0' }}>Today's Usage</p>
                  <h3 style={{ margin: 0 }}>{msgsUsed} / {dailyLimit} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>msgs</span></h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#aeb7d0' }}>Bot Engine</p>
                  <button onClick={toggleBotStatus} style={{ background: botActive ? '#00e676' : '#ff4b4b', padding: '5px 15px', color: '#000', marginTop: '5px' }}>
                    {botActive ? "🟢 ACTIVE" : "🔴 STOPPED"}
                  </button>
                </div>
              </div>
            )}
            
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

      {/* LOCKED BOT SETTINGS */}
      {activeTab === "settings" && (
        <section className="card">
          {plan !== "PREMIUM" ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h3 style={{ color: '#ff4b4b' }}>Premium Required</h3>
              <p>Please redeem a premium key in the Dashboard to access and save Bot Settings.</p>
            </div>
          ) : (
            <>
              <h3>WhatsApp Bot Setup</h3>
              <label style={{ fontSize: '14px', color: '#aeb7d0' }}>WhatsApp Number</label>
              <input placeholder="e.g., 919876543210" style={{ marginBottom: '15px' }} value={waNumber} onChange={(e) => setWaNumber(e.target.value)} />

              <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Business Name</label>
              <input placeholder="e.g., Trade Kingdom" style={{ marginBottom: '15px' }} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              
              <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Custom AI Instructions</label>
              <textarea placeholder="e.g., Always reply in Hinglish. No Cash on Delivery." style={{ minHeight: '100px', marginBottom: '15px' }} value={aiInstructions} onChange={(e) => setAiInstructions(e.target.value)} />
              
              <button onClick={saveBotSettings} disabled={savingSettings}>{savingSettings ? "Saving..." : "Save Settings"}</button>
            </>
          )}
        </section>
      )}

      {/* ADMIN PANEL */}
      {activeTab === "admin" && isAdmin && (
        <section className="card" style={{ border: '1px solid #ff4b4b' }}>
          <h3 style={{ color: '#ff4b4b' }}>Super Admin: Key Generator</h3>
          <div className="row" style={{ marginBottom: '10px' }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: '12px' }}>Days</label><input type="number" value={customDays} onChange={e => setCustomDays(e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: '12px' }}>Msgs/Day</label><input type="number" value={msgLimit} onChange={e => setMsgLimit(e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: '12px' }}>Devices</label><input type="number" value={maxDevices} onChange={e => setMaxDevices(e.target.value)} /></div>
          </div>
          <button onClick={generateCustomKey} style={{ background: '#ff4b4b', color: '#fff', width: '100%' }}>Generate Key</button>
        </section>
      )}
    </div>
  );
}
