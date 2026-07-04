"use client";

import { useEffect, useMemo, useState } from "react";
import useSocket from "@/hooks/useSocket";
import {
  fetchState,
  fetchUsage,
  type Device,
  type OfficeState,
  type UsageState,
} from "@/lib/api_helper";
import StatusPill from "@/components/StatusPill";
import StatsBar from "@/components/StatsBar";
import RoomPanel from "@/components/RoomPanel";
import AlertsPanel from "@/components/AlertsPanel";
import { usePathname, useRouter } from "next/navigation";


const EMPTY_STATE: OfficeState = {
  devices: {},
  stats: { total_power: 0, room_power: {} },
  alerts: [],
};

export default function Home() {
  const { data: socketData, status } = useSocket();
  const [restState, setRestState] = useState<OfficeState>(EMPTY_STATE);
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const hasReloaded = localStorage.getItem("reloaded");

    if (!hasReloaded) {
      localStorage.setItem("reloaded", "true");
      window.location.reload();
    }
  }, []);
 
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [state, usageResp] = await Promise.all([fetchState(), fetchUsage()]);
        if (cancelled) return;
        setRestState(state);
        setUsage(usageResp);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not reach the backend. Is it running on port 8000?",
        );
      }
    };

    load();

    // Refresh REST usage once a minute so the kWh estimate stays current
    // even if the socket is disconnected.
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Live data wins, otherwise we fall back to REST.
  const view: OfficeState = socketData ?? restState;
  const { devices, stats, alerts } = view;

  const devicesByRoom = useMemo(() => {
    const grouped: Record<string, Device[]> = {};
    for (const d of Object.values(devices)) {
      (grouped[d.room] ??= []).push(d);
    }
    // stable order: fans first, then lights, by index
    for (const list of Object.values(grouped)) {
      list.sort((a, b) => a.id.localeCompare(b.id));
    }
    return grouped;
  }, [devices]);

  const roomOrder = useMemo(() => {
    const fromStats = Object.keys(stats.room_power);
    const fromDevices = Object.keys(devicesByRoom);
    const seen = new Set<string>();
    return [...fromStats, ...fromDevices].filter((r) => !seen.has(r) && (seen.add(r) || true));
  }, [stats, devicesByRoom]);

  return (
    <div>
        <header className="flex flex-wrap pb-5 items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
             Live Overview
            </h1>
            <p className="text-sm text-slate-500">
              Live fan & light telemetry across all rooms.
            </p>
          </div>
          <StatusPill status={status} />
        </header>
        {/* ERROR BANNER */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <strong className="font-semibold">Backend unreachable —</strong>{" "}
            {error}. Start it with{" "}
          </div>
        )}

        {/* KPI ROW */}
        <StatsBar stats={stats} usage={usage} />

        {/* ROOMS */}
        <div className="grid mt-5 grid-cols-1 gap-6 xl:grid-cols-1 mb-5">
          {roomOrder.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
              Waiting for telemetry…
            </div>
          ) : (
            roomOrder.map((room) => (
              <RoomPanel
                key={room}
                room={room}
                power={stats.room_power[room] ?? 0}
                devices={devicesByRoom[room] ?? []}
              />
            ))
          )}
        </div>

        {/* ALERTS */}
        <AlertsPanel alerts={alerts} />
      </div>
  );
}
