
import React from 'react';
import { Post } from '../../types';

interface PostGridProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

const PostGrid: React.FC<PostGridProps> = ({ posts, onPostClick }) => {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts.map((post) => (
        <div key={post.id} className="relative aspect-square cursor-pointer group" onClick={() => onPostClick(post)}>
          <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
        </div>
      ))}
    </div>
  );
};

export default PostGrid;
