
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';
import { HomeIcon, PlusSquareIcon, SearchIcon, LogOutIcon } from '../icons';
import CreatePostModal from '../post/CreatePostModal';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-pink-500">
            CoronGateway X bar
          </Link>

          <div className="hidden md:block w-full max-w-xs">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500"
              />
              <div className="absolute top-0 right-0 mt-2 mr-3 text-gray-400">
                <SearchIcon className="w-5 h-5" />
              </div>
            </form>
          </div>

          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-500">
              <HomeIcon className="w-6 h-6" />
            </Link>
            <button onClick={() => navigate('/search')} className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-500 md:hidden">
              <SearchIcon className="w-6 h-6" />
            </button>
            <button onClick={() => setCreatePostModalOpen(true)} className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-500">
              <PlusSquareIcon className="w-6 h-6" />
            </button>
            <button onClick={logout} className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-500">
              <LogOutIcon className="w-6 h-6" />
            </button>
            <Link to={`/profile/${user?.id}`}>
              {user && <Avatar src={user.profileImageUrl} alt={user.username} size="sm" />}
            </Link>
          </nav>
        </div>
      </header>
      <CreatePostModal isOpen={isCreatePostModalOpen} onClose={() => setCreatePostModalOpen(false)} />
    </>
  );
};

export default Header;
