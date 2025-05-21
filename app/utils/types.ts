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
  categoryTitle: string;
  categorySlug: string;
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
  likedByOwner: boolean;
  chiefComment: boolean;
  repliedTo: string | null;
  owner: Owner;
  likedBy?: string[]; // Array de IDs de usuários que curtiram
  replies: CommentResponse[];
}

// Interface para um comentário principal com suas respostas
export interface LatestComment {
  id: string;
  owner: Owner;
  postId: string;
  content: string;
  belongsTo: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies: CommentResponse[]; // Repostas estruturadas
}

export interface LatestUserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  // Adicione outros campos conforme necessário
}
