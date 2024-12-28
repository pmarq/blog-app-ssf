// app/models/Posts.ts

import { Timestamp, DocumentReference } from "firebase-admin/firestore";

// Interface Thumbnail com public_id opcional
export interface Thumbnail {
  url: string;
  public_id: string; // Tornado opcional
}

export function isThumbnail(obj: any): obj is Thumbnail {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.url === 'string' &&
    typeof obj.public_id === 'string'
  );
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  meta: string;
  content: string;
  tags: string[];
  thumbnail: Thumbnail | null; // Atualizado para usar a interface Thumbnail
  images?: Array<{
    path: string;
    url: string;
  }>;
  author: DocumentReference;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  tags: string;
  thumbnail: Thumbnail | null; // Atualizado para usar a interface Thumbnail
  slug: string;
  meta: string;
}
