import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/plans")({
  component: PlansPage,
});

function PlansPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="Subscription Plans" subtitle="Choose the right capacity for your business volume">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading plans...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <Badge variant="secondary">₹{p.price_inr}/mo</Badge>
                </div>
                <CardDescription>{p.daily_limit} AI replies per day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Check className="size-4 text-primary" /> Speed: {p.speed}</div>
                <div className="flex items-center gap-2"><Check className="size-4 text-primary" /> {p.languages.join(", ")}</div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Select Plan</Button>
              </CardFooter>
            </CardCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}
