export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  post_type: string;
  category?: string;
  tags?: string[];
  published: boolean;
  views: number;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  likes_count?: number;
  comments_count?: number;
}

export interface Reel {
  id: number;
  user_id: number;
  video_url: string;
  thumbnail_url?: string;
  caption: string;
  music_title?: string;
  music_artist?: string;
  likes_count: number;
  comments_count: number;
  views: number;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface ReelComment {
  id: number;
  reel_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export const AUTH_URL = 'https://functions.poehali.dev/939b7a78-ca7f-47fb-87a7-d0d621a3d141';
export const POSTS_URL = 'https://functions.poehali.dev/73b67c32-f278-4cd4-8c63-4e2534d8f137';
export const MESSAGES_URL = 'https://functions.poehali.dev/messages';