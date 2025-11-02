import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Post } from '../types';
import { getMockAllPosts } from '../services/api';

interface PostContextType {
  posts: Post[];
  addPost: (post: Post) => void;
  updatePost: (updatedPost: Post) => void;
  deletePost: (postId: string) => void;
  isLoading: boolean;
  error: string | null;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const allPosts = await getMockAllPosts();
        setPosts(allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setError(null);
      } catch (err) {
        setError("Failed to load posts.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const addPost = useCallback((newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, []);

  const updatePost = useCallback((updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  }, []);

  const deletePost = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);


  return (
    <PostContext.Provider value={{ posts, addPost, updatePost, deletePost, isLoading, error }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};