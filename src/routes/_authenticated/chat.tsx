import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { sendChatMessage } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatPage,
});

type Message = { role: "user" | "assistant"; text: string };

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hello! Test your AI business assistant here before connecting WhatsApp." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setBusy(true);

    try {
      const res = await sendChatMessage({ data: { message: text, platform: "chat" } });
      if (res.ok && res.reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: res.reply! }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${res.error ?? "Failed to reply"}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Network error occurred." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="AI Playground" subtitle="Simulate customer chats using your business configuration">
      <Card className="flex flex-col h-[600px]">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {busy && <div className="text-xs text-muted-foreground animate-pulse">AI is typing...</div>}
        </CardContent>
        <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a test message (e.g., What are your prices?)..." />
          <Button type="submit" disabled={busy}>Send</Button>
        </form>
      </Card>
    </AppShell>
  );
}
