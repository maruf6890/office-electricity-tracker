"use client";

import type { SocketStatus } from "@/hooks/useSocket";

const labels: Record<SocketStatus, string> = {
  connecting: "Connecting…",
  open: "Live",
  closed: "Reconnecting…",
  error: "Offline",
};

const tones: Record<SocketStatus, string> = {
  connecting: "bg-amber-100 text-amber-800 ring-amber-200",
  open: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  closed: "bg-amber-100 text-amber-800 ring-amber-200",
  error: "bg-rose-100 text-rose-800 ring-rose-200",
};

const dotTone: Record<SocketStatus, string> = {
  connecting: "bg-amber-500",
  open: "bg-emerald-500 animate-pulse",
  closed: "bg-amber-500",
  error: "bg-rose-500",
};

export default function StatusPill({ status }: { status: SocketStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${tones[status]}`}
      title={`WebSocket status: ${status}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotTone[status]}`} />
      {labels[status]}
    </span>
  );
}