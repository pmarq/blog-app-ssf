export interface Thumbnail {
  url: string;
  public_id?: string;
}

export interface PostDetail {
  id: string;
  title: string;
  content: string;
  meta: string;
  tags: string[];
  slug: string;
  thumbnail: Thumbnail | null;
  createdAt: string;
}

export interface IncomingPost {
  title: string;
  content: string;
  slug: string;
  meta: string;
  tags: string;
}

export interface UserProfile {
  id: string;  
  name: string;
  email: string;
  avatar: string | undefined;
  role: "user" | "admin";
}

