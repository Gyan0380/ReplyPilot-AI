import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { planName, PLATFORM_LABEL } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ReplyPilot AI" },
      { name: "description", content: "Track daily AI replies, plan limits and bot status." },
      { property: "og:title", content: "Dashboard — ReplyPilot AI" },
      { property: "og:description", content: "Track daily AI replies, plan limits and bot status." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();

  const toggleBot = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({ bot_enabled: enabled })
        .eq("id", auth.user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Bot status updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const used = profile?.usage_count ?? 0;
  const limit = profile?.daily_limit ?? 20;
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

  return (
    <AppShell title="Dashboard" subtitle="Your AI assistant at a glance">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">AI bot</CardTitle>
              <Switch
                checked={profile?.bot_enabled ?? false}
                onCheckedChange={(v) => toggleBot.mutate(v)}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{planName(profile?.plan)} plan</Badge>
                {profile?.expires_at ? (
                  <span className="text-xs text-muted-foreground">
                    Valid till {new Date(profile.expires_at).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Today's replies</span>
                  <span className="font-medium">
                    {used} / {limit}
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{profile?.business_name || "No business name set yet."}</p>
              <p className="line-clamp-3">
                {profile?.business_description || "Add your products, prices and policies so the AI can answer correctly."}
              </p>
              <Button asChild size="sm" variant="secondary">
                <Link to="/settings">Edit business info</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>{PLATFORM_LABEL['chat']}</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              {["whatsapp", "facebook", "instagram"].map((p) => (
                <div key={p} className="flex items-center justify-between">
                  <span>{PLATFORM_LABEL[p]}</span>
                  <Badge variant="outline">Coming soon</Badge>
                </div>
              ))}
              <Button asChild size="sm" variant="secondary">
                <Link to="/chat">Open AI Chat</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
