
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { User, Post } from '../types';
import { getMockUserById } from '../services/api';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostGrid from '../components/post/PostGrid';
import Spinner from '../components/common/Spinner';
import PostDetailModal from '../components/post/PostDetailModal';
import EditProfileModal from '../components/profile/EditProfileModal';
import { GridIcon } from '../components/icons';
import { usePosts } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser } = useAuth();
  const { posts: allPosts, isLoading: postsLoading } = usePosts();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!userId) return;
      // If we are viewing our own profile, use the up-to-date authUser object
      if (authUser && authUser.id === userId) {
         setProfileUser(authUser);
         setUserLoading(false);
         return;
      }
      
      try {
        setUserLoading(true);
        const user = await getMockUserById(userId);
        setProfileUser(user);
      } catch (error) {
        console.error("Failed to fetch profile user:", error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchProfileUser();
  }, [userId, authUser]);
  
  const userPosts = useMemo(() => {
    return allPosts.filter(post => post.user.id === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPosts, userId]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };
  
  const loading = userLoading || postsLoading;

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  if (!profileUser) {
    return <div className="text-center mt-20">User not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <ProfileHeader profileUser={profileUser} postCount={userPosts.length} onEditProfile={() => setEditModalOpen(true)} />
      <div className="border-t border-gray-700 mt-4">
        <div className="flex justify-center -mb-px">
          <button className="flex items-center space-x-2 py-4 px-8 border-t-2 border-white text-sm font-semibold">
            <GridIcon className="w-4 h-4" />
            <span>POSTS</span>
          </button>
        </div>
      </div>
      <PostGrid posts={userPosts} onPostClick={handlePostClick} />
      
      <PostDetailModal 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
      />
      
      {isEditModalOpen && 
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setEditModalOpen(false)}
          user={profileUser}
        />
      }
    </div>
  );
};

export default ProfilePage;
