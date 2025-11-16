
// src/services/api.ts (교체본)
// 실제 백엔드 호출 버전. 기존 export 이름을 유지해 컴포넌트/컨텍스트 수정 최소화.

import type { User, Post, Comment } from '../types';

const API_BASE = 'https://xbar-backend-965903745875.asia-northeast3.run.app';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
   // credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    let msg = `API error: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** ---------- Auth ---------- */
export async function signup(email: string, username: string, pass: string): Promise<User> {
  return request<User>('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password: pass }),
  });
}

// 기존 AuthContext는 login(id, pass) 시그니처를 사용하므로 identifier에 그대로 map
export async function login(id: string, pass: string): Promise<User> {
  return request<User>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: id, password: pass }),
  });
}

/** ---------- Users ---------- */
export async function getMockUserById(userId: string): Promise<User> {
  // 이름은 유지하지만 실제로는 서버에서 받아옴
  return request<User>(`/api/users/${encodeURIComponent(userId)}`);
}

export async function updateUser(
  userId: number,
  data: { username?: string; bio?: string; profileImageFile?: File | null }
): Promise<User> {
  const form = new FormData();
  if (data.username !== undefined) form.append('username', data.username);
  if (data.bio !== undefined) form.append('bio', data.bio);
  if (data.profileImageFile) form.append('profileImage', data.profileImageFile);
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: form,
    //credentials: 'include',
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** ---------- Feed / Posts / Comments ---------- */
// 이름을 유지하되 서버 호출로 교체
export async function getMockAllPosts(): Promise<Post[]> {
  return request<Post[]>('/api/feed');
}
export async function getMockFeed(): Promise<Post[]> {
  return getMockAllPosts();
}
export async function getMockPostsByUserId(userId: string): Promise<Post[]> {
  return request<Post[]>(`/api/posts?userId=${encodeURIComponent(userId)}`);
}

export async function createPost(postData: { userId: number; imageFile: File; caption: string }): Promise<Post> {
  const form = new FormData();
  // The backend should infer the user from the session/cookie, so userId is not sent in the form.
  form.append('caption', postData.caption ?? '');
  form.append('image', postData.imageFile);
  // Using fetch directly to send FormData
  const res = await fetch(`${API_BASE}/api/posts`, { 
    method: 'POST', 
    body: form,
    credentials: 'include',
  });
  if (!res.ok) {
    let msg = `API error: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updatePost(postId: string, caption: string): Promise<Post> {
  return request<Post>(`/api/posts/${encodeURIComponent(postId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption }),
  });
}

export async function deletePost(postId: string): Promise<{ id: string }> {
  await request(`/api/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' });
  return { id: postId };
}

export async function addComment(postId: string, userId: number, text: string): Promise<Comment> {
  return request<Comment>(`/api/posts/${encodeURIComponent(postId)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Backend should infer user from session, but following original pattern for now.
    body: JSON.stringify({ userId, text }),
  });
}

export async function updateComment(commentId: string, text: string): Promise<Comment> {
  return request<Comment>(`/api/comments/${encodeURIComponent(commentId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

export async function deleteComment(commentId: string): Promise<{ id: string }> {
  await request(`/api/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
  return { id: commentId };
}

/** ---------- (참고) 모든 유저 불러오기 필요 시 ---------- */
export async function getMockAllUsers(): Promise<User[]> {
  return request<User[]>('/api/users');
}