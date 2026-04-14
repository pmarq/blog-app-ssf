// lib/categories.ts

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/client";

export interface Category {
  id: string;
  title: string;
  slug: string;
}

export async function getCategories(): Promise<Category[]> {
  if (!db) {
    throw new Error(
      "Firebase client não configurado (env NEXT_PUBLIC_FIREBASE_* ausente)."
    );
  }
  const snapshot = await getDocs(collection(db, "categories"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Category, "id">),
  }));
}
