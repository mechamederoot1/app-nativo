type LoginResponse = { access_token: string; token_type: string };

const BASE_URL =
  (typeof process !== 'undefined' &&
    (process as any).env &&
    (process as any).env.EXPO_PUBLIC_API_URL) ||
  'http://localhost:5050';

let memoryToken: string | null = null;

export function setToken(t: string | null) {
  memoryToken = t;
  if (typeof window !== 'undefined' && (window as any).localStorage) {
    if (t) window.localStorage.setItem('token', t);
    else window.localStorage.removeItem('token');
  }
}

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof window !== 'undefined' && (window as any).localStorage) {
    memoryToken = window.localStorage.getItem('token');
  }
  return memoryToken;
}

async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data?.detail || JSON.stringify(data);
    } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function login(email: string, password: string) {
  const data: LoginResponse = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function signup(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) {
  const data: LoginResponse = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(data.access_token);
  return data;
}

export type ApiPost = {
  id: number;
  content: string;
  media_url?: string | null;
  created_at: string;
  user_name: string;
  user_profile_photo?: string | null;
  user_cover_photo?: string | null;
};

export async function getPosts(): Promise<ApiPost[]> {
  return request('/posts');
}

export async function getPostById(id: number | string): Promise<ApiPost> {
  return request(`/posts/${id}`);
}

export async function createPost(content: string, file?: File | Blob) {
  if (file) {
    const form = new FormData();
    form.append('content', content);
    form.append('file', file);
    return request('/posts/upload', { method: 'POST', body: form });
  }
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// React Native helper: upload image from local URI
export async function createPostWithImage(
  content: string,
  file: { uri: string; type: string; name?: string },
) {
  const form = new FormData();
  form.append('content', content);
  form.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name || 'upload.jpg',
  } as any);
  return request('/posts/upload', { method: 'POST', body: form });
}

export async function uploadProfilePhoto(
  file: { uri: string; type: string; name?: string },
  caption?: string,
) {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name || 'profile.jpg',
  } as any);
  if (typeof caption === 'string') form.append('caption', caption);
  return request('/users/profile-photo', { method: 'POST', body: form });
}

export async function uploadCoverPhoto(
  file: { uri: string; type: string; name?: string },
  caption?: string,
) {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name || 'cover.jpg',
  } as any);
  if (typeof caption === 'string') form.append('caption', caption);
  return request('/users/cover-photo', { method: 'POST', body: form });
}

export type ApiUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_photo?: string | null;
  cover_photo?: string | null;
  created_at: string;
};

export async function getUserById(id: number | string): Promise<ApiUser> {
  return request(`/users/${id}`);
}

export async function getUserPosts(id: number | string): Promise<ApiPost[]> {
  return request(`/users/${id}/posts`);
}

export function logout() {
  setToken(null);
}
