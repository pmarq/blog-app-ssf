// /firebase/client.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { coreConfig } from "../lib/firebase/coreConfig"; // Auth centralizado
import { blogConfig } from "@/lib/firebase/blogConfig";
// Firestore do blog

let coreApp, blogApp;

// Auth centralizado
if (!getApps().some((app) => app.name === "core")) {
  coreApp = initializeApp(coreConfig, "core");
} else {
  coreApp = getApps().find((app) => app.name === "core")!;
}
export const auth = getAuth(coreApp);

// Firestore do blog
if (!getApps().some((app) => app.name === "blog")) {
  blogApp = initializeApp(blogConfig, "blog");
} else {
  blogApp = getApps().find((app) => app.name === "blog")!;
}
export const db = getFirestore(blogApp);
