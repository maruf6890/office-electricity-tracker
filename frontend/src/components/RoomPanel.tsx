"use client";

import type { Device } from "@/lib/api_helper";
import DeviceCard from "./DeviceCard";

interface Props {
  room: string;
  power: number;
  devices: Device[];
}

export default function RoomPanel({ room, power, devices }: Props) {
  const onCount = devices.filter((d) => d.status === "on").length;

  return (
    <section className="rounded-2xl w-full bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold capitalize text-slate-900">
            {room.replace(/_/g, " ")}
          </h3>
          <p className="text-xs text-slate-500">
            {onCount}/{devices.length} devices ON
          </p>
        </div>
        <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
          {power} W
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {devices.map((d) => (
          <DeviceCard key={d.id} device={d} />
        ))}
      </div>
    </section>
  );
}