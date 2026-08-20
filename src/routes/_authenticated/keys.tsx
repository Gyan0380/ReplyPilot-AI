import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redeemPremiumKey } from "@/lib/keys.functions";

export const Route = createFileRoute("/_authenticated/keys")({
  component: KeysPage,
});

function KeysPage() {
  const [keyInput, setKeyInput] = useState("");
  const queryClient = useQueryClient();

  const redeemMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await redeemPremiumKey({ data: { key } });
      if (!res.ok) throw new Error(res.error ?? "Failed to redeem key");
      return res;
    },
    onSuccess: (data) => {
      toast.success(`Key redeemed successfully! Upgraded to ${data.plan?.toUpperCase()} plan.`);
      setKeyInput("");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Invalid key"),
  });

  return (
    <AppShell title="Redeem Premium Key" subtitle="Activate an upgrade key issued by your administrator">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Enter License Key</CardTitle>
          <CardDescription>Type or paste your alphanumeric premium key below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); redeemMutation.mutate(keyInput); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Key Code</Label>
              <Input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="RP-XXXX-XXXX-XXXX" />
            </div>
            <Button type="submit" disabled={redeemMutation.isPending || !keyInput.trim()} className="w-full">
              {redeemMutation.isPending ? "Redeeming..." : "Redeem Key"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
