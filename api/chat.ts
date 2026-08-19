import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdmin() {
  if (getApps().length) return getAuth();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin environment variables are missing.");
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey })
  });

  return getAuth();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Login required" });
    }

    const idToken = authHeader.slice("Bearer ".length);
    const decoded = await getFirebaseAdmin().verifyIdToken(idToken);

    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ error: "Message is required" });
    if (message.length > 2000) return res.status(400).json({ error: "Message too long" });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini server key is not configured" });
    }

    // MVP limit placeholder. Replace with Firestore transaction-based usage enforcement.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are ReplyPilot AI, a business customer-support assistant.
Reply naturally in the same language/style as the customer: English, Hindi, or Hinglish.
Be concise, polite and helpful.
Never invent prices, stock, delivery dates, policies or other facts.
If required information is missing, ask a short clarifying question.
Customer message:
${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return res.status(200).json({
      uid: decoded.uid,
      reply: response.text || "Sorry, I couldn't generate a reply."
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}