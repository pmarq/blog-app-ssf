import { Timestamp, DocumentReference } from "firebase-admin/firestore";

export interface Thumbnail {
  url: string;
  public_id?: string; // Tornado opcional
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  meta: string;
  content: string;
  tags: string[];
  thumbnail: {
    url: string;
  } | null;
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
  thumbnail: Thumbnail | null;
  slug: string;
  meta: string;
}
