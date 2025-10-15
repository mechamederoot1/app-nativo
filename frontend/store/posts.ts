export type Comment = { id: string; user: string; text: string };
export type Post = {
  id: string;
  user: string;
  content: string;
  time: string;
  image?: string;
  likes?: number;
  liked?: boolean;
  comments: Comment[];
};

// In-memory store for demo purposes. Replace with backend (e.g., Supabase) later.
let posts: Post[] = [
  {
    id: '1',
    user: 'Alice',
    content:
      'Olá, esta é minha primeira postagem! Adoro construir coisas com React Native ❤️',
    time: '2h',
    image: 'https://picsum.photos/800/600?random=1',
    likes: 12,
    liked: false,
    comments: [{ id: 'c1', user: 'Bruno', text: 'Que massa!' }],
  },
  {
    id: '2',
    user: 'Bruno',
    content: 'Curtindo o dia e construindo um app incrível. #dev',
    time: '3h',
    likes: 4,
    liked: false,
    comments: [
      { id: 'c2', user: 'Alice', text: 'Bora!' },
      { id: 'c3', user: 'Carla', text: 'Top' },
    ],
  },
  {
    id: '3',
    user: 'Carla',
    content: 'Compartilhando uma foto do meu café ☕️',
    time: '4h',
    image: 'https://picsum.photos/800/600?random=2',
    likes: 21,
    liked: false,
    comments: [],
  },
];

const listeners = new Set<() => void>();

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

export function getPosts() {
  return posts;
}

export function getPost(id: string) {
  return posts.find((p) => p.id === String(id));
}

export function setPosts(next: Post[]) {
  posts = next;
  notify();
}

export function addPost(content: string, media?: { image?: string }) {
  const newPost: Post = {
    id: `${Date.now()}`,
    user: 'Você',
    content,
    time: 'agora',
    image: media?.image,
    likes: 0,
    liked: false,
    comments: [],
  };
  posts = [newPost, ...posts];
  notify();
  return newPost;
}

export function toggleLike(id: string) {
  posts = posts.map((p) =>
    p.id === id
      ? {
          ...p,
          liked: !p.liked,
          likes: p.liked ? Math.max((p.likes || 0) - 1, 0) : (p.likes || 0) + 1,
        }
      : p,
  );
  notify();
}

export function addComment(postId: string, text: string, user = 'Você') {
  const comment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user,
    text,
  };
  posts = posts.map((p) =>
    p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
  );
  notify();
  return comment;
}
