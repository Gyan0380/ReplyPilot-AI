import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      let serviceAccount = JSON.parse(serviceAccountKey);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } catch (error) {
    console.error("Firebase Init Error:", error);
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const db = admin.apps.length ? admin.firestore() : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, sender } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // User identifier (agar sender nahi aaya toh default)
    const userId = sender || 'default_user';

    // 1. Firebase se settings fetch karna
    let botSettings = {
      storeName: "Developer Gyan - Digital Store",
      customPrompt: "You are a secure and helpful assistant for Gyan's store.",
      allowOffTopic: true,
      pricesInfo: "Check web catalog for prices."
    };

    if (db) {
      try {
        const settingsDoc = await db.collection('settings').doc('botConfig').get();
        if (settingsDoc.exists) {
          botSettings = { ...botSettings, ...settingsDoc.data() } as any;
        }
      } catch (e) {
        console.log("Using default settings.");
      }
    }

    // 2. Us specific user ki chat history fetch karna taaki data mix na ho
    let userHistory: any[] = [];
    if (db) {
      try {
        const historyRef = db.collection('chats').doc(userId).collection('messages');
        const snapshot = await historyRef.orderBy('timestamp', 'asc').limit(10).get();
        snapshot.forEach(doc => {
          const data = doc.data();
          userHistory.push({ role: data.role, parts: [{ text: data.text }] });
        });
      } catch (e) {
        console.log("History fetch failed.");
      }
    }

    let offTopicRule = botSettings.allowOffTopic 
      ? "Engage politely if user chats casually." 
      : "Strictly focus on store services and products only.";

    const systemInstruction = `
      You are the official bot for ${botSettings.storeName}.
      Instructions: ${botSettings.customPrompt}
      Prices/Info: ${botSettings.pricesInfo}
      ${offTopicRule}
      Never share data of one user with another. Keep conversations strictly isolated.
    `;

    // Chat session start karna with user history
    const chat = ai.models.startChat({
      model: 'gemini-3.6-flash',
      history: userHistory,
      config: {
        systemInstruction: systemInstruction
      }
    });

    const result = await chat.sendMessage({ message });
    const reply = result.text || "Sorry, I couldn't process that.";

    // 3. Nayi chat ko user ke alag folder mein save karna
    if (db) {
      try {
        const historyRef = db.collection('chats').doc(userId).collection('messages');
        await historyRef.add({ role: 'user', text: message, timestamp: Date.now() });
        await historyRef.add({ role: 'model', text: reply, timestamp: Date.now() });
      } catch (e) {
        console.log("Failed to save chat history.");
      }
    }

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
