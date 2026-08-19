# Firebase setup — simple steps

1. Open Firebase Console.
2. Create a project named ReplyPilot AI.
3. Add a Web App.
4. Enable Authentication → Email/Password.
5. Create Firestore Database.
6. Add the Firestore rules from `firebase/firestore.rules`.
7. Enable Storage only if you need profile images/files.
8. Put the Web App config into `.env.local`.
9. Deploy the frontend.
10. For secure server API authentication, configure Firebase Admin environment variables on your server.

Start on Firebase's Spark/no-cost plan for the MVP. Some server-side Google Cloud/Firebase services require Blaze, so do not assume every backend feature is free.
