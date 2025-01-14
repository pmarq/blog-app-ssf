// app/models/Banner.ts

import { Timestamp, DocumentReference } from "firebase-admin/firestore";

export interface Banner {
  id: string;
  title: string;
  link: string;
  linkTitle: string;
  banner: {
    url: string;
    public_id: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FeaturedBanner {
  id: string;
  title: string;
  link: string;
  linkTitle: string;
  imageUrl: string;
  publicId: string;
}
