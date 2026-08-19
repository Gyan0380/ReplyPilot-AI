import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Firebase Admin initialization safe check
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      let serviceAccount = JSON.parse(serviceAccountKey);
      
      // Clean up private key newlines safely
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing from environment variables.");
    }
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Updated to use the correct model name
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
    });

    const reply = response.text || "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
