import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignup() {
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setMessage(e.message || "Signup failed");
      setBusy(false);
    }
  }

  async function handleLogin() {
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setMessage(e.message || "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <section className="hero">
        <span className="badge">ReplyPilot AI • MVP</span>
        <h1>AI auto-replies for your business.</h1>
        <p>Login to manage your bots and test responses.</p>
      </section>

      <section className="card">
        <h2>Account Login</h2>
        <input 
          placeholder="Email address" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <div className="row">
          <button onClick={handleLogin} disabled={busy}>Login</button>
          <button className="secondary" onClick={handleSignup} disabled={busy}>Create Account</button>
        </div>
        {message && <small>{message}</small>}
      </section>
    </div>
  );
}
