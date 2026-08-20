import { Link, useNavigate } from "@tanstack/react-router";
import {
  BotMessageSquare,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/settings", label: "Business", icon: Settings },
  { to: "/devices", label: "Devices", icon: Smartphone },
  { to: "/plans", label: "Plans", icon: Sparkles },
  { to: "/keys", label: "Premium key", icon: KeyRound },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BotMessageSquare className="size-5" />
            </span>
            <span className="font-display text-base font-semibold">ReplyPilot AI</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                to="/admin"
                className="rounded-lg px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
                activeProps={{ className: "bg-primary/10" }}
              >
                Admin
              </Link>
            ) : null}
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:ml-0"
            aria-label="Sign out"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-surface/95 backdrop-blur-xl md:hidden">
        <div className="flex items-stretch justify-between px-1 py-1.5">
          {NAV.slice(0, 5).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              to="/admin"
              className="flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <Shield className="size-5" />
              Admin
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
