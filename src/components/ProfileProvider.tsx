"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { ApiError, apiFetch } from "@/lib/api";
import { subscribeToChannel } from "@/lib/realtime";
import type { AppNotification, Profile } from "@/lib/types";

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  notifications: AppNotification[];
  unread: number;
  refreshProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const ProfileContext = createContext<ProfileState>({
  profile: null,
  loading: true,
  notifications: [],
  unread: 0,
  refreshProfile: async () => {},
  refreshNotifications: async () => {},
  markRead: async () => {},
  markAllRead: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const mounted = useRef(true);

  const loadProfile = useCallback(async () => {
    if (!isSignedIn) {
      if (mounted.current) {
        setProfile(null);
        setLoading(false);
      }
      return;
    }

    try {
      const token = await getToken();
      let data: { profile: Profile };
      try {
        data = await apiFetch<{ profile: Profile }>("/api/profile/me", token);
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          const synced = await apiFetch<{ profile: Profile }>(
            "/api/profile/sync",
            token,
            { method: "POST" }
          );
          data = { profile: synced.profile };
        } else {
          throw error;
        }
      }
      if (mounted.current) setProfile(data.profile);
    } catch (error) {
      console.error("Profile load failed:", error);
      if (mounted.current) setProfile(null);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [isSignedIn, getToken]);

  const loadNotifications = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const data = await apiFetch<{
        notifications: AppNotification[];
        unread: number;
      }>("/api/notifications", token);
      if (mounted.current) {
        setNotifications(data.notifications ?? []);
      }
    } catch (error) {
      // Notifications are non-critical; ignore failures.
      console.warn("Notification load failed", error);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    mounted.current = true;
    if (!isLoaded) return;
    void Promise.resolve().then(() => loadProfile());
    return () => {
      mounted.current = false;
    };
  }, [isLoaded, loadProfile]);

  useEffect(() => {
    if (!profile) return;
    void Promise.resolve().then(() => loadNotifications());

    const unsubscribe = subscribeToChannel(
      `profile:${profile.id}`,
      "notification:new",
      (payload: unknown) => {
        const notification = payload as AppNotification;
        setNotifications((current) => {
          if (current.some((n) => n.id === notification.id)) return current;
          return [notification, ...current].slice(0, 50);
        });
      }
    );

    const interval = window.setInterval(() => void loadNotifications(), 30000);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [profile, loadNotifications]);

  const markRead = useCallback(
    async (id: string) => {
      const token = await getToken();
      await apiFetch(`/api/notifications/${id}/read`, token, { method: "PATCH" });
      setNotifications((current) =>
        current.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    },
    [getToken]
  );

  const markAllRead = useCallback(async () => {
    const token = await getToken();
    await apiFetch("/api/notifications/read-all", token, { method: "PATCH" });
    setNotifications((current) =>
      current.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
    );
  }, [getToken]);

  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        notifications,
        unread,
        refreshProfile: loadProfile,
        refreshNotifications: loadNotifications,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
