
import React, { useState, useCallback } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostContext';
import { createPost } from '../../services/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addPost } = usePosts();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !caption || !user) {
      alert('Please select an image and write a caption.');
      return;
    }
    setIsLoading(true);

    try {
      // In a real app, you'd upload the file to a service like S3 and get a URL.
      // For this mock, we'll use the local preview URL.
      const newPost = await createPost({
        userId: user.id,
        imageUrl: preview!,
        caption,
      });
      addPost(newPost);
      resetAndClose();
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Something went wrong, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = useCallback(() => {
    setFile(null);
    setPreview(null);
    setCaption('');
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Create New Post">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {!preview ? (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
          ) : (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full max-h-80 object-contain rounded-lg" />
              <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1">&times;</button>
            </div>
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption... #cool #awesome"
            rows={4}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !file || !caption}>
              {isLoading ? <Spinner /> : 'Share'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
