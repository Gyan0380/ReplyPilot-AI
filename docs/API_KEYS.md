# ReplyPilot AI — API / Config Checklist

## 1. Gemini API key — FREE MVP
Get it from Google AI Studio API Keys.

Where it goes:
- Vercel Project → Settings → Environment Variables
- Name: `GEMINI_API_KEY`
- Value: your Gemini key
- NEVER use `VITE_GEMINI_API_KEY`.

Google currently offers a Gemini API Free Tier with limited model/rate access. Limits can change.

## 2. Firebase Web App config — FREE
Firebase Console → Project settings → Your apps → Web app → SDK setup/config.

Copy:
- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId

These are frontend Firebase configuration values. They are NOT the same type of secret as the Gemini key, but Firestore/Storage Security Rules must still protect your data.

Put them in `.env.local` as the VITE_* variables shown in `.env.example`.

## 3. Firebase Admin credentials — SERVER ONLY
Needed for secure server-side authorization.

For a Vercel deployment, use:
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY

Do NOT commit a service-account JSON file to GitHub.

## 4. Meta APIs — LATER
For WhatsApp/Messenger/Instagram, create a Meta developer app and use official OAuth/access-token/webhook flows.

Do NOT ask customers for their Meta/WhatsApp passwords.

These integrations are NOT enabled by this starter because they require Meta app setup, permissions and business/account configuration.

## 5. Payments — LATER
No payment API is needed for the free MVP.
When payments are added, use a payment gateway with server-side webhook verification.
