// /firebase/client.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { blogConfig } from "@/lib/firebase/blogConfig";

const APP_NAME = "ssf-blog";
const FIRESTORE_DATABASE_ID =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID ?? "(default)";
let app: ReturnType<typeof initializeApp> | null = null;

const canInit =
  !!blogConfig?.apiKey &&
  !!blogConfig?.authDomain &&
  !!blogConfig?.projectId &&
  !!blogConfig?.appId;

if (canInit) {
  if (!getApps().some((a) => a.name === APP_NAME)) {
    app = initializeApp(blogConfig, APP_NAME);
  } else {
    app = getApps().find((a) => a.name === APP_NAME)!;
  }
} else {
  // Evita quebrar `next build` quando as env públicas são injetadas só no runtime.
  // Em runtime, sem essas env, o Auth/Firestore realmente não funcionará.
  console.warn(
    "[firebase/client] NEXT_PUBLIC_FIREBASE_* ausentes. Firebase client não inicializado."
  );
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app, FIRESTORE_DATABASE_ID) : null;
export const storage = app ? getStorage(app) : null;
