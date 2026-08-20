export type PlanTier = "free" | "low" | "high" | "ultra";

export type PlanMeta = {
  id: PlanTier;
  name: string;
  dailyLimit: number;
  languages: string[];
  speed: string;
  platforms: string[];
  priceInr: number;
  blurb: string;
};

/** Fallback catalog. The live values always come from the `plans` table. */
export const PLAN_CATALOG: Record<PlanTier, PlanMeta> = {
  free: {
    id: "free",
    name: "FREE",
    dailyLimit: 20,
    languages: ["English"],
    speed: "Slow",
    platforms: ["whatsapp"],
    priceInr: 0,
    blurb: "Try ReplyPilot with 20 AI replies every day.",
  },
  low: {
    id: "low",
    name: "LOW",
    dailyLimit: 150,
    languages: ["English", "Hinglish"],
    speed: "Medium",
    platforms: ["whatsapp", "facebook"],
    priceInr: 199,
    blurb: "For small shops handling a steady flow of messages.",
  },
  high: {
    id: "high",
    name: "HIGH",
    dailyLimit: 400,
    languages: ["Hindi", "Hinglish", "English"],
    speed: "Fast",
    platforms: ["whatsapp", "facebook", "instagram"],
    priceInr: 499,
    blurb: "Full Hindi + Hinglish support across all three channels.",
  },
  ultra: {
    id: "ultra",
    name: "ULTRA",
    dailyLimit: 2000,
    languages: ["Indian languages", "English"],
    speed: "Fast",
    platforms: ["whatsapp", "facebook", "instagram"],
    priceInr: 999,
    blurb: "High volume support with wide Indian language coverage.",
  },
};

export const PLAN_ORDER: PlanTier[] = ["free", "low", "high", "ultra"];

export const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook Messenger",
  instagram: "Instagram",
  chat: "AI Chat",
};

export const TONE_OPTIONS = ["friendly", "professional", "casual", "short"] as const;

export const LANGUAGE_MODES = [
  { value: "auto", label: "Auto detect" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish" },
  { value: "indian", label: "Auto Indian language" },
] as const;

export function planName(plan: string | null | undefined) {
  if (!plan) return "FREE";
  return PLAN_CATALOG[plan as PlanTier]?.name ?? plan.toUpperCase();
}
