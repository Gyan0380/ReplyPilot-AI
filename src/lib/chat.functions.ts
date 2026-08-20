import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SendInput = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  platform: z.string().default("chat"),
});

export type SendChatResult = {
  ok: boolean;
  reply?: string;
  language?: string;
  cached?: boolean;
  remaining?: number;
  error?: string;
};

/** Generates an AI reply. Quota + plan checks always happen on the server. */
export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SendInput.parse(input))
  .handler(async ({ data, context }): Promise<SendChatResult> => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "business_name, business_description, business_products, business_prices, delivery_info, refund_policy, contact_info, business_hours, tone, language_mode, instructions, bot_enabled, status",
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) return { ok: false, error: profileError.message };
    if (!profile) return { ok: false, error: "Profile not found." };
    if (profile.status === "blocked")
      return { ok: false, error: "Your account is blocked. Please contact support." };
    if (!profile.bot_enabled)
      return { ok: false, error: "The AI bot is turned off. Enable it in Settings." };

    const { generateReply } = await import("./ai-engine.server");

    let reply;
    try {
      reply = await generateReply({
        message: data.message,
        context: {
          businessName: profile.business_name,
          businessDescription: profile.business_description,
          businessProducts: profile.business_products,
          businessPrices: profile.business_prices,
          deliveryInfo: profile.delivery_info,
          refundPolicy: profile.refund_policy,
          contactInfo: profile.contact_info,
          businessHours: profile.business_hours,
          tone: profile.tone,
          languageMode: profile.language_mode,
          instructions: profile.instructions,
        },
        history: await loadHistory(supabase, userId, data.conversationId),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed.";
      return { ok: false, error: message };
    }

    const { data: usage, error: usageError } = await supabase.rpc("consume_usage", {
      _platform: data.platform,
      _language: reply.language,
      _cached: reply.cached,
    });

    if (usageError) return { ok: false, error: usageError.message };

    const result = usage as { ok?: boolean; error?: string; remaining?: number } | null;
    if (!result?.ok) {
      return {
        ok: false,
        error:
          result?.error === "limit_reached"
            ? "Daily reply limit reached. Upgrade your plan for more replies."
            : (result?.error ?? "Usage could not be recorded."),
      };
    }

    const conversationId = data.conversationId;
    await supabase.from("chats").insert([
      {
        user_id: userId,
        role: "user",
        text: data.message,
        platform: data.platform,
        language: reply.language,
        ...(conversationId ? { conversation_id: conversationId } : {}),
      },
      {
        user_id: userId,
        role: "assistant",
        text: reply.text,
        platform: data.platform,
        language: reply.language,
        ...(conversationId ? { conversation_id: conversationId } : {}),
      },
    ]);

    return {
      ok: true,
      reply: reply.text,
      language: reply.language,
      cached: reply.cached,
      ...(typeof result.remaining === "number" ? { remaining: result.remaining } : {}),
    };
  });

async function loadHistory(
  supabase: { from: (t: "chats") => any },
  userId: string,
  conversationId?: string,
) {
  let query = supabase
    .from("chats")
    .select("role, text")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (conversationId) query = query.eq("conversation_id", conversationId);
  const { data } = await query;
  return ((data ?? []) as { role: string; text: string }[])
    .reverse()
    .map((row) => ({ role: row.role === "assistant" ? "assistant" : "user", text: row.text }))
    .map((row) => ({ role: row.role as "user" | "assistant", content: row.text }));
}
