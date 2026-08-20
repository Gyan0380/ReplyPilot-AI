import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGE_MODES, TONE_OPTIONS } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    business_name: "",
    business_description: "",
    business_products: "",
    business_prices: "",
    delivery_info: "",
    refund_policy: "",
    contact_info: "",
    business_hours: "",
    tone: "friendly",
    language_mode: "auto",
    instructions: "",
    bot_enabled: true,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-settings"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        business_name: profile.business_name ?? "",
        business_description: profile.business_description ?? "",
        business_products: profile.business_products ?? "",
        business_prices: profile.business_prices ?? "",
        delivery_info: profile.delivery_info ?? "",
        refund_policy: profile.refund_policy ?? "",
        contact_info: profile.contact_info ?? "",
        business_hours: profile.business_hours ?? "",
        tone: profile.tone ?? "friendly",
        language_mode: profile.language_mode ?? "auto",
        instructions: profile.instructions ?? "",
        bot_enabled: profile.bot_enabled ?? true,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").update(values).eq("id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-settings"] });
      toast.success("Business profile saved successfully!");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to save"),
  });

  if (isLoading) return <AppShell title="Business Settings"><p className="text-sm text-muted-foreground">Loading...</p></AppShell>;

  return (
    <AppShell title="Business Profile & Settings" subtitle="Configure the facts your AI uses to reply to customers">
      <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Core details about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="e.g. Sharma Electronics" />
            </div>
            <div className="space-y-2">
              <Label>Business Description</Label>
              <Textarea value={form.business_description} onChange={(e) => setForm({ ...form, business_description: e.target.value })} placeholder="What does your business do?" />
            </div>
            <div className="space-y-2">
              <Label>Products / Services</Label>
              <Textarea value={form.business_products} onChange={(e) => setForm({ ...form, business_products: e.target.value })} placeholder="List your items or services" />
            </div>
            <div className="space-y-2">
              <Label>Pricing Information</Label>
              <Textarea value={form.business_prices} onChange={(e) => setForm({ ...form, business_prices: e.target.value })} placeholder="Prices or price ranges" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policies & Logistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Delivery Information</Label>
              <Textarea value={form.delivery_info} onChange={(e) => setForm({ ...form, delivery_info: e.target.value })} placeholder="Shipping times, charges, areas" />
            </div>
            <div className="space-y-2">
              <Label>Refund & Return Policy</Label>
              <Textarea value={form.refund_policy} onChange={(e) => setForm({ ...form, refund_policy: e.target.value })} placeholder="Return windows, conditions" />
            </div>
            <div className="space-y-2">
              <Label>Business Hours & Contact</Label>
              <Input value={form.business_hours} onChange={(e) => setForm({ ...form, business_hours: e.target.value })} placeholder="e.g. Mon-Sat 10am - 8pm" />
              <Input className="mt-2" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="Phone or email for support" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Behavior & Tone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language Mode</Label>
                <Select value={form.language_mode} onValueChange={(v) => setForm({ ...form, language_mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_MODES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Custom Instructions</Label>
              <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Extra custom prompt instructions for the AI" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={updateMutation.isPending} className="w-full">
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </AppShell>
  );
}
