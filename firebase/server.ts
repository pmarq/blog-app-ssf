import admin from "firebase-admin";
import {
  App,
  ServiceAccount,
  AppOptions,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { Storage, getStorage } from "firebase-admin/storage";

/**
 * Firebase Admin SDK (projeto único)
 * - Reaproveita as mesmas ENV do app principal (Sabores Sem Fronteiras)
 * - NÃO commitar JSON de service account
 * - FIREBASE_PRIVATE_KEY pode vir com "\\n" (replace resolve)
 */

type EnvServiceAccount = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

const envServiceAccount: EnvServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined,
};

const hasServiceAccount = (v: EnvServiceAccount): v is ServiceAccount =>
  typeof v.projectId === "string" &&
  v.projectId.length > 0 &&
  typeof v.clientEmail === "string" &&
  v.clientEmail.length > 0 &&
  typeof v.privateKey === "string" &&
  v.privateKey.length > 0;

const ADMIN_APP_NAME = "ssf-blog";

// Bucket real do projeto (sempre .appspot.com)
const STORAGE_BUCKET: string | undefined =
  process.env.FIREBASE_STORAGE_BUCKET ||
  (process.env.FIREBASE_PROJECT_ID
    ? `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    : undefined);

function assertEnvForProd(): void {
  if (process.env.NODE_ENV !== "production") return;

  const missing: string[] = [];
  if (!envServiceAccount.projectId) missing.push("FIREBASE_PROJECT_ID");
  if (!envServiceAccount.clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!envServiceAccount.privateKey) missing.push("FIREBASE_PRIVATE_KEY");
  if (!STORAGE_BUCKET) missing.push("FIREBASE_STORAGE_BUCKET");

  // Não dar throw no import (isso quebra `next build` quando as ENV só existem no runtime).
  // Em runtime, o SDK falha naturalmente se não houver credenciais (ou ADC).
  if (missing.length) {
    console.warn(
      `[firebase/server] Variáveis ausentes em produção (build/runtime): ${missing.join(", ")}.`
    );
  }
}

function getOrInitAdminApp(): App {
  assertEnvForProd();

  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existing) return existing;

  // Se PRIVATE_KEY não vier, o Admin SDK tenta GOOGLE_APPLICATION_CREDENTIALS (ADC).
  const options: AppOptions = {};
  if (hasServiceAccount(envServiceAccount)) {
    options.credential = cert(envServiceAccount);
  }
  if (STORAGE_BUCKET) {
    options.storageBucket = STORAGE_BUCKET;
  }

  return initializeApp(options, ADMIN_APP_NAME);
}

const adminApp = getOrInitAdminApp();

export const auth: Auth = getAuth(adminApp);
const FIRESTORE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID ?? "(default)";
export const firestore: Firestore = getFirestore(adminApp, FIRESTORE_DATABASE_ID);
export const storageAdmin: Storage = getStorage(adminApp);
export const storage: Storage = storageAdmin;

export { admin };
