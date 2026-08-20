import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RedeemInput = z.object({ key: z.string().min(6).max(120) });

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toUpperCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type RedeemResult = { ok: boolean; plan?: string; error?: string };

/** The raw premium key is hashed on the server; only hashes are stored. */
export const redeemPremiumKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RedeemInput.parse(input))
  .handler(async ({ data, context }): Promise<RedeemResult> => {
    const hash = await sha256Hex(data.key);
    const { data: result, error } = await context.supabase.rpc("redeem_premium_key", {
      _key_hash: hash,
    });
    if (error) return { ok: false, error: error.message };
    const parsed = result as { ok?: boolean; plan?: string; error?: string } | null;
    if (!parsed?.ok) {
      const map: Record<string, string> = {
        not_found: "This key does not exist.",
        already_redeemed: "This key has already been used.",
        revoked: "This key has been revoked.",
        expired: "This key has expired.",
      };
      return { ok: false, error: map[parsed?.error ?? ""] ?? (parsed?.error ?? "Key invalid.") };
    }
    return { ok: true, ...(parsed.plan ? { plan: parsed.plan } : {}) };
  });

const CreateKeyInput = z.object({
  plan: z.enum(["free", "low", "high", "ultra"]),
  dailyLimit: z.number().int().positive(),
  deviceLimit: z.number().int().positive(),
  durationDays: z.number().int().positive(),
  validDays: z.number().int().positive(),
  label: z.string().max(120).default(""),
});

function randomKey() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const body = Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
  return `RP-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}-${body.slice(12, 16)}`;
}

/** Admin only (enforced inside the database function). Returns the raw key once. */
export const createPremiumKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateKeyInput.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: boolean; key?: string; error?: string }> => {
    const key = randomKey();
    const hash = await sha256Hex(key);
    const { data: result, error } = await context.supabase.rpc("admin_create_key", {
      _key_hash: hash,
      _plan: data.plan,
      _daily_limit: data.dailyLimit,
      _device_limit: data.deviceLimit,
      _duration_days: data.durationDays,
      _valid_days: data.validDays,
      _label: data.label,
    });
    if (error) return { ok: false, error: error.message };
    const parsed = result as { ok?: boolean; error?: string } | null;
    if (!parsed?.ok) return { ok: false, error: parsed?.error ?? "Could not create key." };
    return { ok: true, key };
  });
