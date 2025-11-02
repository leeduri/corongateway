
import React from 'react';
import PostCard from '../components/post/PostCard';
import Spinner from '../components/common/Spinner';
import { usePosts } from '../contexts/PostContext';

const HomePage: React.FC = () => {
  const { posts, isLoading } = usePosts();

  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container mx-auto max-w-lg p-4">
      {isLoading ? (
        <div className="flex justify-center mt-20">
          <Spinner />
        </div>
      ) : (
        sortedPosts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};

export default HomePage;