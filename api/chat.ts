import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const { message } = req.body;

    // 1. Fetch User Data & Limits
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return res.status(404).json({ error: 'User profile not found' });
    const userData = userDoc.data();
    
    // Default to FREE tier limits if not explicitly set
    const dailyLimit = userData?.dailyLimit || 20; 
    
    // Check account Expiry
    if (userData?.expiry && new Date(userData.expiry) < new Date()) {
       return res.status(403).json({ error: 'Plan expired. Please renew.' });
    }

    // 2. Fetch/Update Daily Usage
    const today = new Date().toISOString().split('T')[0];
    const usageRef = userRef.collection('usage').doc(today);
    const usageDoc = await usageRef.get();
    const currentUsage = usageDoc.exists ? usageDoc.data()?.count || 0 : 0;

    if (currentUsage >= dailyLimit) {
      return res.status(403).json({ error: `Daily limit of ${dailyLimit} messages reached.` });
    }

    // 3. System Instructions based on user settings
    const botSettings = userData?.botSettings || {};
    const baseInstruction = "You are a helpful business assistant. Reply naturally and concisely in the user's language (English, Hindi, or Hinglish).";
    const customInstruction = botSettings.instruction ? `Business Instructions: ${botSettings.instruction}` : "";
    
    const finalInstruction = `${baseInstruction}\n${customInstruction}`;

    // 4. Call Gemini
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: message }] }],
        config: { systemInstruction: finalInstruction }
    });

    // 5. Increment Usage securely on backend
    await usageRef.set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });

    return res.status(200).json({ reply: response.text });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
