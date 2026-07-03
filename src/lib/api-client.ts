const API_BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "linkvault:token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Request failed", res.status);
  return data as T;
}

export type ApiUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  avatar?: string;
};

export type ApiBookmark = {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon?: string;
  tags: string[];
  notes: string;
  isPublic: boolean;
  pinned: boolean;
  createdAt: string;
};

export const api = {
  signup: (name: string, email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: ApiUser }>("/auth/me"),
  updateProfile: (patch: Partial<Pick<ApiUser, "name" | "bio" | "avatar">>) =>
    request<{ user: ApiUser }>("/users/me", { method: "PATCH", body: JSON.stringify(patch) }),
  listBookmarks: () => request<{ bookmarks: ApiBookmark[] }>("/bookmarks"),
  createBookmark: (b: Partial<ApiBookmark>) =>
    request<{ bookmark: ApiBookmark }>("/bookmarks", { method: "POST", body: JSON.stringify(b) }),
  updateBookmark: (id: string, patch: Partial<ApiBookmark>) =>
    request<{ bookmark: ApiBookmark }>(`/bookmarks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteBookmark: (id: string) => request<void>(`/bookmarks/${id}`, { method: "DELETE" }),
  publicProfile: (username: string) =>
    request<{ user: Pick<ApiUser, "username" | "name" | "bio" | "avatar">; bookmarks: ApiBookmark[] }>(
      `/public/${username}`,
    ),
};
