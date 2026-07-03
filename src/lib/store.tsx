import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken, type ApiBookmark, type ApiUser } from "./api-client";

export type Bookmark = ApiBookmark;
export type User = ApiUser;

type State = {
  user: User | null;
  bookmarks: Bookmark[];
  isLoading: boolean;
};

type Ctx = State & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  addBookmark: (b: Omit<Bookmark, "id" | "createdAt" | "pinned"> & { pinned?: boolean }) => Promise<void>;
  updateBookmark: (id: string, patch: Partial<Bookmark>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
  updateProfile: (p: Partial<Pick<User, "name" | "bio" | "avatar">>) => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ user: null, bookmarks: [], isLoading: true });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getToken();
      if (!token) {
        if (!cancelled) setState((s) => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const { user } = await api.me();
        const { bookmarks } = await api.listBookmarks();
        if (!cancelled) setState({ user, bookmarks, isLoading: false });
      } catch {
        setToken(null);
        if (!cancelled) setState({ user: null, bookmarks: [], isLoading: false });
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      signIn: async (email, password) => {
        const { token, user } = await api.login(email, password);
        setToken(token);
        const { bookmarks } = await api.listBookmarks();
        setState({ user, bookmarks, isLoading: false });
      },
      signUp: async (name, email, password) => {
        const { token, user } = await api.signup(name, email, password);
        setToken(token);
        setState({ user, bookmarks: [], isLoading: false });
      },
      signOut: () => {
        setToken(null);
        setState({ user: null, bookmarks: [], isLoading: false });
      },
      addBookmark: async (b) => {
        const { bookmark } = await api.createBookmark(b);
        setState((s) => ({ ...s, bookmarks: [bookmark, ...s.bookmarks] }));
      },
      updateBookmark: async (id, patch) => {
        const { bookmark } = await api.updateBookmark(id, patch);
        setState((s) => ({
          ...s,
          bookmarks: s.bookmarks.map((b) => (b.id === id ? bookmark : b)),
        }));
      },
      deleteBookmark: async (id) => {
        await api.deleteBookmark(id);
        setState((s) => ({ ...s, bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
      },
      togglePin: async (id) => {
        const current = state.bookmarks.find((b) => b.id === id);
        if (!current) return;
        const { bookmark } = await api.updateBookmark(id, { pinned: !current.pinned });
        setState((s) => ({
          ...s,
          bookmarks: s.bookmarks.map((b) => (b.id === id ? bookmark : b)),
        }));
      },
      toggleVisibility: async (id) => {
        const current = state.bookmarks.find((b) => b.id === id);
        if (!current) return;
        const { bookmark } = await api.updateBookmark(id, { isPublic: !current.isPublic });
        setState((s) => ({
          ...s,
          bookmarks: s.bookmarks.map((b) => (b.id === id ? bookmark : b)),
        }));
      },
      updateProfile: async (p) => {
        const { user } = await api.updateProfile(p);
        setState((s) => ({ ...s, user }));
      },
    }),
    [state],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function faviconFor(url: string) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return undefined;
  }
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
