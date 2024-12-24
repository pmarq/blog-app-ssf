interface CreatePostResponse {
    postId?: string;
    error?: boolean;
    message?: string;
  }
  
  interface SavePostImagesParams {
    postId: string;
    paths: string[];
  }
  