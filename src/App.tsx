import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { getIdToken } from "./services/auth";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  async function signup() {
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created. Firebase user is ready.");
    } catch (e: any) {
      setMessage(e.message || "Signup failed");
    } finally { setBusy(false); }
  }

  async function login() {
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Logged in.");
    } catch (e: any) {
      setMessage(e.message || "Login failed");
    } finally { setBusy(false); }
  }

  async function testAI() {
    if (!message.trim()) return;
    setBusy(true);
    setReply("");
    try {
      const token = await getIdToken();
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "AI request failed");
      setReply(data.reply);
    } catch (e: any) {
      setReply(e.message || "AI request failed");
    } finally { setBusy(false); }
  }

  return (
    <main className="shell">
      <section className="hero">
        <span className="badge">ReplyPilot AI • MVP</span>
        <h1>AI auto-replies for your business.</h1>
        <p>Test English, Hindi and Hinglish replies before connecting official messaging platforms.</p>
      </section>

      <section className="card">
        <h2>Account</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="row">
          <button onClick={signup} disabled={busy}>Create account</button>
          <button className="secondary" onClick={login} disabled={busy}>Login</button>
        </div>
        <small>{message}</small>
      </section>

      <section className="card">
        <h2>AI Test Chat</h2>
        <textarea
          placeholder="Example: Bhai price kya hai?"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button onClick={testAI} disabled={busy || !message.trim()}>Test AI Reply</button>
        {reply && <div className="reply">{reply}</div>}
      </section>
    </main>
  );
}