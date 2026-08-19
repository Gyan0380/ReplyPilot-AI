# Vercel setup

## Build settings
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Environment Variables

Add these in Vercel → Project → Settings → Environment Variables.

### Frontend Firebase config
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

### Server-only
- GEMINI_API_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY

Do NOT add GEMINI_API_KEY with a VITE_ prefix.

## Important
After changing environment variables, deploy again. Vercel injects VITE_* variables at build time, so they must exist before `npm run build`.

The project includes `src/vite-env.d.ts`, which fixes TypeScript's `ImportMeta.env` typing error.
