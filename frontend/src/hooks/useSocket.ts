"use client";

import { useEffect, useRef, useState } from "react";
import type { OfficeState } from "@/lib/api_helper";

export type SocketStatus = "connecting" | "open" | "closed" | "error";

export interface SocketBundle {
  data: OfficeState | null;
  status: SocketStatus;
}

/**
 * Connects to the backend's `/ws` endpoint.
 * - Auto-reconnects with exponential backoff (capped).
 * - Falls back gracefully when the backend is offline.
 */
export default function useSocket(): SocketBundle {
  const [data, setData] = useState<OfficeState | null>(null);
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const closedByHookRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    const url =
      process.env.NEXT_PUBLIC_WS || "ws://localhost:8000/ws";

    const connect = () => {
      if (closedByHookRef.current) return;

      try {
        setStatus("connecting");
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          retryRef.current = 0;
          setStatus("open");
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data) as OfficeState;
            setData(parsed);
          } catch {
            // ignore non-JSON frames
          }
        };

        ws.onerror = () => {
          setStatus("error");
        };

        ws.onclose = () => {
          setStatus("closed");
          wsRef.current = null;

          if (closedByHookRef.current) return;

          // exponential backoff up to 8s
          const delay = Math.min(8000, 500 * 2 ** retryRef.current);
          retryRef.current += 1;
          reconnectTimerRef.current = setTimeout(connect, delay);
        };
      } catch {
        setStatus("error");
        const delay = Math.min(8000, 500 * 2 ** retryRef.current);
        retryRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };

    connect();

    return () => {
      closedByHookRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent our reconnect path
        wsRef.current.close();
      }
    };
  }, []);

  return { data, status };
}