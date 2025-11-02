import { User, Post, Comment } from '../types';

// --- MOCK DATA ---
let users: User[] = [
  { id: '1', username: 'bret', email: 'bret@example.com', profileImageUrl: 'https://picsum.photos/seed/bret/200', bio: 'Living the dream, one post at a time.', followers: 1302, following: 340 },
  { id: '2', username: 'antonette', email: 'ant@example.com', profileImageUrl: 'https://picsum.photos/seed/ant/200', bio: 'Art, code, and everything in between.', followers: 504, following: 120 },
  { id: '3', username: 'samantha', email: 'sam@example.com', profileImageUrl: 'https://picsum.photos/seed/sam/200', bio: 'Travel enthusiast and foodie.', followers: 890, following: 455 },
];

let posts: Post[] = [
  { id: 'p1', user: { id: '1', username: 'bret', profileImageUrl: 'https://picsum.photos/seed/bret/200' }, imageUrl: 'https://picsum.photos/seed/post1/600/600', caption: 'Beautiful sunset today!', hashtags: ['sunset', 'nature', 'travel'], likes: [{id: 'l1', userId: '2'}], comments: [{id: 'c1', user: {id: '2', username: 'antonette', profileImageUrl: 'https://picsum.photos/seed/ant/200'}, text: 'Wow amazing!', createdAt: '2023-10-27T10:00:00Z'}], createdAt: '2023-10-27T09:00:00Z' },
  { id: 'p2', user: { id: '2', username: 'antonette', profileImageUrl: 'https://picsum.photos/seed/ant/200' }, imageUrl: 'https://picsum.photos/seed/post2/600/600', caption: 'My new painting.', hashtags: ['art', 'painting', 'creative'], likes: [], comments: [], createdAt: '2023-10-26T15:30:00Z' },
  { id: 'p3', user: { id: '3', username: 'samantha', profileImageUrl: 'https://picsum.photos/seed/sam/200' }, imageUrl: 'https://picsum.photos/seed/post3/600/600', caption: 'Delicious pasta I made.', hashtags: ['food', 'pasta', 'cooking', 'travel'], likes: [], comments: [], createdAt: '2023-10-25T12:00:00Z' },
  { id: 'p4', user: { id: '1', username: 'bret', profileImageUrl: 'https://picsum.photos/seed/bret/200' }, imageUrl: 'https://picsum.photos/seed/post4/600/600', caption: 'Hiking adventure!', hashtags: ['hiking', 'nature', 'adventure'], likes: [], comments: [], createdAt: '2023-10-24T18:00:00Z' },
];

const MOCK_API_DELAY = 500;

// --- MOCK API FUNCTIONS ---

export const login = (username: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.username === username);
      if (user && pass === 'password123') {
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, MOCK_API_DELAY);
  });
};

export const signup = (email: string, username: string, pass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
          reject(new Error('Username or email already exists'));
          return;
        }
        
        const newUser: User = {
          id: String(Date.now()),
          username,
          email,
          profileImageUrl: `https://picsum.photos/seed/${username}/200`,
          bio: 'Just joined!',
          followers: 0,
          following: 0,
        };

        users.push(newUser);
        resolve(newUser);
      }, MOCK_API_DELAY);
    });
};

export const updateUser = (userId: string, data: Partial<Pick<User, 'username' | 'bio' | 'profileImageUrl'>>): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return reject(new Error("User not found"));
      }
      users[userIndex] = { ...users[userIndex], ...data };
      
      // Also update user info in posts
      posts.forEach(post => {
        if (post.user.id === userId) {
          post.user.username = users[userIndex].username;
          post.user.profileImageUrl = users[userIndex].profileImageUrl;
        }
      });
      
      resolve(users[userIndex]);
    }, MOCK_API_DELAY);
  });
};


export const getMockUserById = (userId: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('User not found'));
      }
    }, MOCK_API_DELAY);
  });
};

export const getMockAllUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(users);
      }, MOCK_API_DELAY);
    });
};

export const createPost = (postData: {userId: string; imageUrl: string; caption: string}): Promise<Post> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.id === postData.userId);
      if (!user) {
        return reject(new Error('User not found'));
      }
      const hashtags = postData.caption.match(/#\w+/g)?.map(h => h.substring(1)) || [];
      const cleanedCaption = postData.caption.replace(/#\w+/g, '').trim();

      const newPost: Post = {
        id: `p${Date.now()}`,
        user: { id: user.id, username: user.username, profileImageUrl: user.profileImageUrl },
        imageUrl: postData.imageUrl,
        caption: cleanedCaption,
        hashtags,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
      posts.unshift(newPost);
      resolve(newPost);
    }, MOCK_API_DELAY);
  });
};

export const updatePost = (postId: string, newCaption: string): Promise<Post> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        return reject(new Error("Post not found"));
      }
      
      const updatedPost = { ...posts[postIndex] };
      updatedPost.caption = newCaption.replace(/#\w+/g, '').trim();
      updatedPost.hashtags = newCaption.match(/#\w+/g)?.map(h => h.substring(1)) || [];
      
      posts[postIndex] = updatedPost;
      resolve(updatedPost);
    }, MOCK_API_DELAY);
  });
};

export const deletePost = (postId: string): Promise<{ id: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = posts.length;
      posts = posts.filter(p => p.id !== postId);
      if (posts.length === initialLength) {
        return reject(new Error("Post not found"));
      }
      resolve({ id: postId });
    }, MOCK_API_DELAY);
  });
};

export const addComment = (postId: string, userId: string, text: string): Promise<Post> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      const postIndex = posts.findIndex(p => p.id === postId);
      if (!user || postIndex === -1) {
        return reject(new Error("User or Post not found"));
      }

      const newComment: Comment = {
        id: `c${Date.now()}`,
        user: { id: user.id, username: user.username, profileImageUrl: user.profileImageUrl },
        text,
        createdAt: new Date().toISOString(),
      };

      posts[postIndex].comments.push(newComment);
      resolve({ ...posts[postIndex] });
    }, MOCK_API_DELAY);
  });
};

export const updateComment = (postId: string, commentId: string, newText: string): Promise<Post> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        return reject(new Error("Post not found"));
      }
      
      const post = posts[postIndex];
      const commentIndex = post.comments.findIndex(c => c.id === commentId);
      
      if (commentIndex === -1) {
        return reject(new Error("Comment not found"));
      }

      post.comments[commentIndex].text = newText;
      
      posts[postIndex] = { ...post };
      resolve(posts[postIndex]);
    }, MOCK_API_DELAY);
  });
};

export const deleteComment = (postId: string, commentId: string): Promise<Post> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        return reject(new Error("Post not found"));
      }
      
      const post = posts[postIndex];
      const initialCommentCount = post.comments.length;
      post.comments = post.comments.filter(c => c.id !== commentId);

      if (post.comments.length === initialCommentCount) {
        return reject(new Error("Comment not found"));
      }
      
      posts[postIndex] = { ...post };
      resolve(posts[postIndex]);
    }, MOCK_API_DELAY);
  });
};


export const getMockPostsByUserId = (userId: string): Promise<Post[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userPosts = posts.filter(p => p.user.id === userId);
            resolve(userPosts);
        }, MOCK_API_DELAY);
    });
};


export const getMockAllPosts = (): Promise<Post[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...posts]);
        }, MOCK_API_DELAY);
    });
};

export const getMockFeed = (): Promise<Post[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            resolve(sortedPosts);
        }, MOCK_API_DELAY);
    });
};