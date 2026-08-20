import { createFileRoute, Link } from "@tanstack/react-router";
import { BotMessageSquare, Check, MessageSquare, Settings, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});


function HomePage() {
  const features = [
    { icon: MessageSquare, title: "AI replies", text: "Generate customer replies in Hindi, Hinglish and English." },
    { icon: Settings, title: "Business context", text: "Give the assistant your products, prices, policies and tone." },
    { icon: Smartphone, title: "Device sessions", text: "See the devices currently connected to your ReplyPilot setup." },
    { icon: Sparkles, title: "Plans & Premium", text: "Track usage, plans and premium keys from one dashboard." },
  ];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BotMessageSquare className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold">ReplyPilot AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
            <Button asChild><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-20 text-center md:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BotMessageSquare className="size-8" />
          </div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">AI customer support</p>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Reply faster with ReplyPilot AI</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            A simple workspace for AI-powered customer replies, business context, connected devices and usage tracking.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/auth">Start using ReplyPilot</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/auth">Sign in</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <feature.icon className="size-6 text-primary" />
            <h2 className="mt-4 font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} ReplyPilot AI</span>
          <span className="flex items-center gap-2"><Check className="size-4 text-primary" /> Built for fast customer replies</span>
        </div>
      </section>
    </main>
  );
}
