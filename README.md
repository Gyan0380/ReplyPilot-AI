# ReplyPilot AI — Free-first MVP

Secure, mobile-first AI Auto-Reply SaaS starter.

## Stack
- React + TypeScript + Vite
- Firebase Authentication + Firestore
- Vercel serverless API
- Gemini API server-side
- Tailwind-free responsive CSS to keep the starter simple

## Required secrets/config
Frontend (`.env.local`):
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Server/Vercel Environment Variables:
- GEMINI_API_KEY

Never put GEMINI_API_KEY in a VITE_ variable or frontend code.

## Run
npm install
npm run dev

## Build
npm run build

## API
POST /api/chat
Body:
{ "message": "Bhai price kya hai?" }

The endpoint checks Firebase ID token authentication before calling Gemini.

## Important
This ZIP is an MVP foundation. WhatsApp, Messenger, Instagram and payments are intentionally not faked or marked as connected. They require official Meta authorization/app credentials and server-side webhook/token handling.
