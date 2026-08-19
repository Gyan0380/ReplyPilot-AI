import { useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getIdToken } from "../services/auth";

export default function Dashboard({ user }: { user: User }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

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
        <h2>ReplyPilot Dashboard</h2>
        <button className="secondary" onClick={() => signOut(auth)}>Logout</button>
      </header>

      <section className="card" style={{ marginBottom: '20px' }}>
        <h3>Account Profile</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>UID:</strong> <span style={{ fontSize: '12px', opacity: 0.7 }}>{user.uid}</span></p>
        <p><strong>Current Plan:</strong> <span style={{ color: '#7c5cff', fontWeight: 'bold' }}>FREE</span> (20 msgs/day)</p>
      </section>

      <section className="card">
        <h3>AI Test Chat</h3>
        <p style={{ fontSize: '14px', marginBottom: '10px' }}>
          Test your AI response before connecting to WhatsApp.
        </p>
        <textarea
          placeholder="Example: Bhai price kya hai?"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button onClick={testAI} disabled={busy || !message.trim()}>Send Test Message</button>
        {reply && <div className="reply">{reply}</div>}
      </section>
    </div>
  );
}
