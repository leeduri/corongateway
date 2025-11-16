
export interface User {
  id: number;
  username: string;
  email: string;
  profileImageUrl: string;
  bio: string;
  followers: number;
  following: number;
}

export interface Comment {
  id: string;
  user: Pick<User, 'id' | 'username' | 'profileImageUrl'>;
  text: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: number;
}

export interface Post {
  id: string;
  user: Pick<User, 'id' | 'username' | 'profileImageUrl'>;
  imageUrl: string;
  caption: string;
  hashtags: string[];
  likes: Like[];
  comments: Comment[];
  createdAt: string;
}