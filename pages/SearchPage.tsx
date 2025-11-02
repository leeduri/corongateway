import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import { User } from '../types';
import { recommendUsersByHashtags } from '../services/geminiService';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const params = new URLSearchParams(location.search);
  const searchQuery = params.get('q');

  const performSearch = useCallback(async (searchQuery: string) => {
    const hashtags = searchQuery.match(/#\w+/g)?.map(h => h.substring(1)) || [];
    if (hashtags.length === 0) {
      setRecommendedUsers([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const users = await recommendUsersByHashtags(hashtags);
      setRecommendedUsers(users);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    } else {
      setQuery('');
      setRecommendedUsers([]);
    }
  }, [searchQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      {!searchQuery && <h1 className="text-2xl font-bold mb-4">Discover Users</h1>}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <div className="flex-grow">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter hashtags, e.g., #travel #food"
          />
        </div>
        <Button type="submit" disabled={isLoading}>Search</Button>
      </form>

      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!isLoading && recommendedUsers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          {recommendedUsers.map(user => (
            <Link to={`/profile/${user.id}`} key={user.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <Avatar src={user.profileImageUrl} alt={user.username} />
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-gray-400">{user.bio}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!isLoading && recommendedUsers.length === 0 && searchQuery && (
        <p className="text-center text-gray-400">No users found for these tags. Try a different search.</p>
      )}
    </div>
  );
};

export default SearchPage;
