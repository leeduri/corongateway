
import React from 'react';
import { User } from '../../types';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileHeaderProps {
  profileUser: User;
  postCount: number;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileUser, postCount, onEditProfile }) => {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === profileUser.id;
  const [isFollowing, setIsFollowing] = React.useState(false); // Mock state

  const handleFollow = () => {
    // Mock API call
    setIsFollowing(!isFollowing);
  };
  
  return (
    <div className="flex items-start p-4 md:p-8 space-x-4 md:space-x-10">
      <div className="flex-shrink-0">
        <Avatar src={profileUser.profileImageUrl} alt={profileUser.username} size="xl" />
      </div>
      <div className="flex-grow space-y-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-light">{profileUser.username}</h1>
          {isOwnProfile ? (
            <Button variant="secondary" onClick={onEditProfile}>Edit Profile</Button>
          ) : (
            <Button onClick={handleFollow}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
        <div className="flex space-x-8">
          <div><span className="font-semibold">{postCount}</span> posts</div>
          <div><span className="font-semibold">{profileUser.followers}</span> followers</div>
          <div><span className="font-semibold">{profileUser.following}</span> following</div>
        </div>
        <div>
          <p className="font-semibold">{profileUser.username}</p>
          <p className="text-gray-400">{profileUser.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
