import { useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getIdToken } from "../services/auth";

export default function Dashboard({ user }: { user: User }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'settings'

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

  return (
    <div className="shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>ReplyPilot AI</h2>
        <button className="secondary" onClick={() => signOut(auth)}>Logout</button>
      </header>

      {/* Navigation Tabs */}
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
            <h3>Account Profile</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Current Plan:</strong> <span style={{ color: '#7c5cff', fontWeight: 'bold' }}>FREE</span> (20 msgs/day)</p>
          </section>

          <section className="card">
            <h3>AI Test Chat</h3>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>Test your AI response before connecting to WhatsApp.</p>
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
          {/* Bot Settings Feature */}
          <section className="card" style={{ marginBottom: '20px' }}>
            <h3>Bot Settings</h3>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>Train your AI on how to reply to customers.</p>
            
            <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Business Name</label>
            <input placeholder="e.g., Trade Kingdom" />

            <label style={{ fontSize: '14px', color: '#aeb7d0' }}>Custom AI Instructions</label>
            <textarea placeholder="e.g., Always reply in Hinglish. Be polite. Product price is 500 Rs." style={{ minHeight: '80px' }} />
            
            <button>Save Settings</button>
          </section>

          {/* Connected Platforms Feature */}
          <section className="card">
            <h3>Connected Platforms</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1427', padding: '15px', borderRadius: '12px', marginBottom: '10px' }}>
              <div>
                <h4 style={{ margin: 0 }}>WhatsApp</h4>
                <small style={{ margin: 0 }}>Not connected</small>
              </div>
              <button className="secondary" disabled>Connect (Coming Soon)</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1427', padding: '15px', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: 0 }}>Instagram</h4>
                <small style={{ margin: 0 }}>Requires Premium Plan</small>
              </div>
              <button className="secondary" disabled>Locked</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
