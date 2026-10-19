"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useProfile } from "./ProfileProvider";
import { formatDateTime } from "@/lib/format";

export default function NotificationBell() {
  const { notifications, unread, markRead, markAllRead } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="relative rounded-lg border border-slate-700 px-3 py-2 text-lg hover:bg-slate-800"
      >
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-xs font-bold text-slate-950">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <span className="font-semibold">Notifications</span>
            {unread > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="text-xs text-cyan-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400">
                No notifications yet.
              </p>
            ) : (
              notifications.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className={`border-b border-slate-800 px-4 py-3 text-sm ${
                    item.read_at ? "opacity-70" : "bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{item.title}</p>
                    {!item.read_at && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <p className="mt-1 text-slate-400">{item.body}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{formatDateTime(item.created_at)}</span>
                    <div className="flex gap-3">
                      {item.ride_id && (
                        <Link
                          href={`/rides/${item.ride_id}`}
                          onClick={() => {
                            if (!item.read_at) void markRead(item.id);
                            setOpen(false);
                          }}
                          className="text-cyan-400 hover:underline"
                        >
                          View ride
                        </Link>
                      )}
                      {!item.read_at && (
                        <button
                          onClick={() => void markRead(item.id)}
                          className="hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
