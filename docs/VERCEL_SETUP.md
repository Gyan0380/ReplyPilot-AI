# Vercel setup

1. Push this project to a private GitHub repository.
2. Import the repository into Vercel.
3. Add the frontend `VITE_FIREBASE_*` variables.
4. Add server-only:
   - GEMINI_API_KEY
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY
5. Redeploy.

Never put server-only variables in frontend source code.
