"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getRealtimeClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}

/**
 * Subscribe to a Supabase Realtime broadcast channel.
 * Channel names are UUID-based and not guessable (ride:{id}, profile:{id}).
 * Returns an unsubscribe function.
 */
export function subscribeToChannel(
  channelName: string,
  event: string,
  handler: (payload: unknown) => void
): () => void {
  const supabase = getRealtimeClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(channelName)
    .on("broadcast", { event }, ({ payload }) => handler(payload))
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
