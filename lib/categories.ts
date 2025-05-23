// lib/categories.ts

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/client";

export interface Category {
  id: string;
  title: string;
  slug: string;
}

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, "categories"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Category, "id">),
  }));
}
