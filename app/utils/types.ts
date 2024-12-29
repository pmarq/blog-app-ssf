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

// app/utils/types.ts

export interface Owner {
  id: string;
  name: string;
  avatar: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  likedByOwner: boolean; // Indica se o usuário atual já curtiu
  chiefComment: boolean;
  repliedTo: string | null;
  owner: Owner;
  replies: CommentResponse[];
  likedBy?: string[]; // Array de IDs de usuários que curtiram
}
