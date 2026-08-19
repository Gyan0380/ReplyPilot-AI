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
    const { message, sender, licenseKey } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. License Key Check (Subscription Verification)
    if (!licenseKey) {
      return res.status(401).json({ error: 'License key is missing. Please provide a valid key.' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database connection error.' });
    }

    // Firestore se client ki key fetch karna
    const licenseDoc = await db.collection('licenses').doc(licenseKey).get();

    if (!licenseDoc.exists) {
      return res.status(403).json({ error: 'Invalid License Key!' });
    }

    const licenseData = licenseDoc.data();
    const currentTime = Date.now();

    // Expiry check (Agar 1 month khatam ho gaya)
    if (licenseData?.expiresAt && currentTime > licenseData.expiresAt) {
      return res.status(403).json({ 
        error: 'Your subscription has expired. Please renew your plan from admin panel.' 
      });
    }

    if (licenseData?.status !== 'active') {
      return res.status(403).json({ error: 'License is suspended or inactive.' });
    }

    // 2. Client-Specific Bot Settings Fetch Karna
    const clientSettings = licenseData.botSettings || {
      storeName: "Custom Business",
      customPrompt: "You are a helpful assistant.",
      allowOffTopic: true,
      pricesInfo: "Contact admin for pricing."
    };

    const userId = sender || 'default_user';

    // 3. User Chat History Fetch Karna
    let userHistory: any[] = [];
    const historyRef = db.collection('licenses').doc(licenseKey).collection('chats').doc(userId).collection('messages');
    const snapshot = await historyRef.orderBy('timestamp', 'asc').limit(10).get();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      userHistory.push({ role: data.role, parts: [{ text: data.text }] });
    });

    // Add current message to contents array for context
    const contents = [
      ...userHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const offTopicRule = clientSettings.allowOffTopic 
      ? "Engage politely if user chats casually." 
      : "Strictly focus on store services and products only.";

    const systemInstruction = `
      You are the official bot for ${clientSettings.storeName}.
      Instructions: ${clientSettings.customPrompt}
      Prices/Info: ${clientSettings.pricesInfo}
      ${offTopicRule}
      Never share data of other clients.
    `;

    // Generate content with full history and system instruction
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction
      }
    });

    const reply = response.text || "Sorry, I couldn't process that.";

    // Chat History Save in Firestore
    await historyRef.add({ role: 'user', text: message, timestamp: currentTime });
    await historyRef.add({ role: 'model', text: reply, timestamp: currentTime + 1 });

    return res.status(200).json({ reply });

  } catch (error: any) {
    console.ch ?? console.error("API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
