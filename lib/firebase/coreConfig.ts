// lib/firebase/coreConfig.ts

export const coreConfig = {
  apiKey: process.env.NEXT_PUBLIC_CORE_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_CORE_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_CORE_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_CORE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_CORE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_CORE_FIREBASE_APP_ID!,
};
