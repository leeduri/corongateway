
import React, { useState, useEffect, useRef } from 'react';
import { Post, Comment } from '../../types';
import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';
import { HeartIcon, MessageCircleIcon, SendIcon, PencilIcon, TrashIcon, MoreHorizontalIcon, XIcon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { usePosts } from '../../contexts/PostContext';
import * as api from '../../services/api';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';


interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, onClose, post }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { updatePost, deletePost } = usePosts();

  // Like State
  const [isLiked, setIsLiked] = useState(post?.likes.some(like => like.userId === currentUser?.id));
  const [likeCount, setLikeCount] = useState(post?.likes.length || 0);
  
  // New Comment State
  const [newCommentText, setNewCommentText] = useState('');

  // Post Caption Edit State
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post?.caption || '');

  // Comment Edit State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  
  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Delete confirmation state
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
      if (post) {
        setIsLiked(post.likes.some(like => like.userId === currentUser?.id));
        setLikeCount(post.likes.length);
        // Only update the edited caption from the prop if the user is not currently editing.
        // This prevents wiping out in-progress edits if the post object updates in the background.
        if (!isEditingCaption) {
          setEditedCaption(post.caption + ' ' + post.hashtags.map(h => `#${h}`).join(' '));
        }
      } else {
        // Reset states when modal is closed or post is null
        setIsEditingCaption(false);
        setEditingCommentId(null);
      }
  }, [post, currentUser, isEditingCaption]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);


  if (!isOpen || !post) return null;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim() && currentUser) {
       try {
        const updatedPost = await api.addComment(post.id, currentUser.id, newCommentText);
        updatePost(updatedPost);
        setNewCommentText('');
      } catch (error) {
        showToast('Failed to add comment.');
      }
    }
  };

  const handleSaveCaption = async () => {
    try {
      const updatedPostData = await api.updatePost(post.id, editedCaption);
      updatePost(updatedPostData);
      setIsEditingCaption(false);
      showToast('Post updated successfully!');
    } catch (error) {
      showToast('Failed to update post.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingCaption(false);
    // Reset text to original post content if user cancels
    setEditedCaption(post.caption + ' ' + post.hashtags.map(h => `#${h}`).join(' '));
  };
  
  const handleConfirmDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
        await api.deletePost(post.id);
        deletePost(post.id);
        showToast('Post deleted successfully.');
        setConfirmDeleteOpen(false);
        onClose(); // Close the main modal after deletion
    } catch (error) {
        showToast('Failed to delete post.');
    } finally {
        setIsDeleting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const handleSaveComment = async (commentId: string) => {
    try {
      const updatedPost = await api.updateComment(post.id, commentId, editedCommentText);
      updatePost(updatedPost);
      setEditingCommentId(null);
    } catch (error) {
      showToast('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
       try {
        const updatedPost = await api.deleteComment(post.id, commentId);
        updatePost(updatedPost);
        showToast('Comment deleted.');
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
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 overflow-y-auto"
        onClick={onClose}
        >
        <div className="flex items-start md:items-center justify-center min-h-screen p-0 md:p-4 text-left">
            <button onClick={onClose} className="fixed top-4 right-4 text-white z-50 opacity-70 hover:opacity-100">
                <XIcon className="h-8 w-8" />
            </button>
            <div 
              className="bg-gray-800 shadow-xl w-full md:max-w-5xl md:max-h-[90vh] md:rounded-lg flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="w-full md:w-[55%] lg:w-[60%] bg-black flex items-center justify-center md:rounded-l-lg">
                  <img src={post.imageUrl} alt={post.caption} className="w-full h-auto object-contain max-h-[60vh] md:max-h-full" />
              </div>

              {/* Details Section */}
              <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between space-x-3 border-b border-gray-700 p-4 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <Avatar src={post.user.profileImageUrl} alt={post.user.username} />
                    <Link to={`/profile/${post.user.id}`} className="font-semibold text-sm">{post.user.username}</Link>
                  </div>
                  {currentUser?.id === post.user.id && !isEditingCaption && (
                    <div className="relative" ref={menuRef}>
                      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white">
                          <MoreHorizontalIcon className="w-5 h-5"/>
                      </button>
                      {isMenuOpen && (
                          <div className="absolute right-0 mt-2 w-40 bg-gray-900 rounded-md shadow-lg z-20 border border-gray-700">
                              <ul className="py-1">
                                  <li>
                                      <button
                                          onClick={() => {
                                              setIsEditingCaption(true);
                                              setIsMenuOpen(false);
                                          }}
                                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                      >
                                          <PencilIcon className="w-4 h-4" /> Edit Post
                                      </button>
                                  </li>
                                  <li>
                                      <button
                                          onClick={() => {
                                            setIsMenuOpen(false);
                                            setConfirmDeleteOpen(true);
                                          }}
                                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                                      >
                                          <TrashIcon className="w-4 h-4" /> Delete Post
                                      </button>
                                  </li>
                              </ul>
                          </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content & Comments (Scrollable) */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Avatar src={post.user.profileImageUrl} alt={post.user.username} size="sm" />
                    <div className="flex-grow">
                        {isEditingCaption ? (
                          <div className="space-y-2">
                            <textarea
                                value={editedCaption}
                                onChange={(e) => setEditedCaption(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-white text-sm"
                                rows={4}
                              />
                              <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                                <Button onClick={handleSaveCaption}>Save</Button>
                              </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">
                              <Link to={`/profile/${post.user.id}`} className="font-semibold mr-2">{post.user.username}</Link>
                              <span>{post.caption}</span>
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {post.hashtags.map((tag) => (
                                <Link key={tag} to={`/search?q=#${tag}`} className="text-pink-400 text-sm">#{tag}</Link>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  {post.comments.map(c => (
                      <div key={c.id} className="flex items-start space-x-3 text-sm group">
                          <Avatar src={c.user.profileImageUrl} alt={c.user.username} size="sm" />
                          <div className="flex-grow">
                              {editingCommentId === c.id ? (
                                <div className="flex items-center gap-2">
                                  <input type="text" value={editedCommentText} onChange={(e) => setEditedCommentText(e.target.value)} className="bg-gray-700 text-white w-full rounded px-2 py-1 text-sm"/>
                                  <button onClick={() => handleSaveComment(c.id)} className="text-xs text-green-400 hover:underline">Save</button>
                                  <button onClick={() => setEditingCommentId(null)} className="text-xs text-red-400 hover:underline">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Link to={`/profile/${c.user.id}`} className="font-semibold mr-2">{c.user.username}</Link>
                                    <span>{c.text}</span>
                                    <p className="text-gray-400 text-xs mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  {currentUser?.id === c.user.id && (
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleEditComment(c)}><PencilIcon className="w-3 h-3 text-gray-400 hover:text-white" /></button>
                                      <button onClick={() => handleDeleteComment(c.id)}><TrashIcon className="w-3 h-3 text-gray-400 hover:text-red-500" /></button>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                      </div>
                  ))}
                </div>

                {/* Actions & Comment Form (Fixed at bottom) */}
                <div className="border-t border-gray-700 p-4 flex-shrink-0">
                  <div className="flex space-x-4 mb-2">
                    <button onClick={handleLike}>
                      <HeartIcon className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                    </button>
                    <button><MessageCircleIcon className="w-6 h-6" /></button>
                    <button onClick={handleShare}><SendIcon className="w-6 h-6" /></button>
                  </div>
                  <p className="font-semibold text-sm mb-2">{likeCount} likes</p>
                  <form onSubmit={handleCommentSubmit} className="flex">
                    <input type="text" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Add a comment..." className="bg-transparent w-full outline-none text-sm"/>
                    <button type="submit" className="text-pink-500 font-semibold text-sm" disabled={!newCommentText.trim()}>Post</button>
                  </form>
                </div>
              </div>
            </div>

        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmText="Delete"
        isConfirming={isDeleting}
      />
    </>
  );
};

export default PostDetailModal;
