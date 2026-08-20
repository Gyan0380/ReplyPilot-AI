import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Smartphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/devices")({
  component: DevicesPage,
});

function DevicesPage() {
  const { data: devices, isLoading } = useQuery({
    queryKey: ["user-devices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("devices").select("*").order("last_active", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="Connected Devices" subtitle="Manage your active WhatsApp and client bridge connections">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="size-5 text-primary" /> Active Sessions
            </CardTitle>
            <CardDescription>Devices currently authorized to interact with your AI assistant.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading devices...</p>
            ) : devices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active devices registered yet. Run your bot script to connect.</p>
            ) : (
              <div className="space-y-3">
                {devices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {d.device_id}</p>
                    </div>
                    <Badge variant={d.status === "active" ? "default" : "outline"}>{d.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
