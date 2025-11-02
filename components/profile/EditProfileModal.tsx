
import React, { useState } from 'react';
import { User } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../common/Spinner';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUser } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(user.profileImageUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUser({
        username,
        bio,
        profileImageFile,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <Avatar src={preview} alt="Profile preview" size="lg" />
          <label htmlFor="profile-image-upload" className="text-pink-500 font-semibold cursor-pointer text-sm">
            Change profile photo
          </label>
          <input id="profile-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          rows={3}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Submit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
