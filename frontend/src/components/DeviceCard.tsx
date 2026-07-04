"use client";

import type { Device } from "@/lib/api_helper";
import { FaFan, FaLightbulb } from "react-icons/fa6";

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleString();
}

export default function DeviceCard({ device }: { device: Device }) {
  const on = device.status === "on";
  const tone = on
    ? "bg-emerald-50 ring-emerald-200 text-emerald-900"
    : "bg-slate-50 ring-slate-200 text-slate-600";



  return (
    <div
      className={`rounded-xl p-3 ring-1 ${tone} transition-colors`}
      title={`Last changed: ${formatRelative(device.last_changed)}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden>
            {device.type === "fan" ? (
              <FaFan
                className={`text-emerald-500 size-4.5 ${on ? "animate-spin" : "animate-none"}`}
              />
            ) : (
              <FaLightbulb
                className={`size- ${on ? "animate-pulse text-yellow-400 " : "animate-none text-slate-400"}`}
              />
            )}
          </span>
          {device.name}
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            on ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
          }`}
        >
          {device.status}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="opacity-70">{device.power_watt} W</span>
        <span className="opacity-60">
          {formatRelative(device.last_changed)}
        </span>
      </div>
    </div>
  );
}