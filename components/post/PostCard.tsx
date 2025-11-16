import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../types';
import Avatar from '../common/Avatar';
import { HeartIcon, MessageCircleIcon, SendIcon, PencilIcon, TrashIcon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { usePosts } from '../../contexts/PostContext';
import { addComment, updateComment, deleteComment } from '../../services/api';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { updatePost } = usePosts();
  const [isLiked, setIsLiked] = useState(post.likes?.some(like => like.userId === currentUser?.id) ?? false);
  const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);
  const [commentText, setCommentText] = useState('');
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    // In a real app, you would call an API here.
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && currentUser) {
      try {
        const newComment = await addComment(post.id, currentUser.id, commentText);
        const updatedPostWithNewComment: Post = {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
        updatePost(updatedPostWithNewComment);
        setCommentText('');
      } catch (error) {
        showToast('Failed to add comment.');
      }
    }
  };

  const handleEditComment = (comment: Post['comments'][0]) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const handleSaveComment = async (commentId: string) => {
    try {
      const updatedComment = await updateComment(commentId, editedCommentText);
      const updatedPostWithEditedComment: Post = {
          ...post,
          comments: (post.comments ?? []).map(c => c.id === commentId ? { ...c, ...updatedComment } : c),
      };
      updatePost(updatedPostWithEditedComment);
      setEditingCommentId(null);
      setEditedCommentText('');
    } catch (error) {
      showToast('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
        const updatedPostAfterDelete: Post = {
            ...post,
            comments: (post.comments ?? []).filter(c => c.id !== commentId),
        };
        updatePost(updatedPostAfterDelete);
      } catch (error) {
        showToast('Failed to delete comment.');
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#/post/${post.id}`);
    showToast('Link copied to clipboard!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6 animate-fade-in">
      <div className="p-4 flex items-center space-x-3">
        <Avatar src={post.user.profileImageUrl} alt={post.user.username} />
        <Link to={`/profile/${post.user.id}`} className="font-semibold text-sm">{post.user.username}</Link>
      </div>

      <img src={post.imageUrl} alt={post.caption} className="w-full object-cover" />

      <div className="p-4">
        <div className="flex space-x-4 mb-2">
          <button onClick={handleLike}>
            <HeartIcon className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
          </button>
          <button>
            <MessageCircleIcon className="w-6 h-6" />
          </button>
          <button onClick={handleShare}>
            <SendIcon className="w-6 h-6" />
          </button>
        </div>

        <p className="font-semibold text-sm">{likeCount} likes</p>

        <div className="text-sm my-2">
          <Link to={`/profile/${post.user.id}`} className="font-semibold mr-2">{post.user.username}</Link>
          <span>{post.caption}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
           {(post.hashtags ?? []).map((tag) => (
             <Link key={tag} to={`/search?q=#${tag}`} className="text-pink-400 text-sm">#{tag}</Link>
           ))}
        </div>

        <div className="text-gray-400 text-xs uppercase mt-2">{new Date(post.createdAt).toLocaleDateString()}</div>

        <div className="mt-4 space-y-2">
            {(post.comments ?? []).slice(0,2).map(c => (
                <div key={c.id} className="text-sm group">
                  {editingCommentId === c.id ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={editedCommentText} onChange={(e) => setEditedCommentText(e.target.value)} className="bg-gray-700 text-white w-full rounded px-2 py-1 text-sm"/>
                      <button onClick={() => handleSaveComment(c.id)} className="text-xs text-green-400">Save</button>
                      <button onClick={() => setEditingCommentId(null)} className="text-xs text-red-400">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/profile/${c.user.id}`} className="font-semibold mr-2">{c.user.username}</Link>
                        <span>{c.text}</span>
                      </div>
                      {currentUser?.id === c.user.id && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditComment(c)}><PencilIcon className="w-3 h-3 text-gray-400 hover:text-white" /></button>
                          <button onClick={() => handleDeleteComment(c.id)}><TrashIcon className="w-3 h-3 text-gray-400 hover:text-red-500" /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            ))}
            {(post.comments?.length ?? 0) > 2 && <button className="text-gray-400 text-sm">View all {post.comments.length} comments</button>}
        </div>
      </div>

      <form onSubmit={handleCommentSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4 flex">
        <input 
          type="text" 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..." 
          className="bg-transparent w-full outline-none text-sm"
        />
        <button type="submit" className="text-pink-500 font-semibold text-sm" disabled={!commentText.trim()}>Post</button>
      </form>
    </div>
  );
};

export default PostCard;
