"use client";

import type { Stats, UsageState } from "@/lib/api_helper";
import { FaHome } from "react-icons/fa";
import {  FiZap } from "react-icons/fi";
import { MdBatteryCharging20 } from "react-icons/md";

interface Props {
  stats?: Stats;
  usage?: UsageState | null;
}

export default function StatsBar({ stats, usage }: Props) {
  const total = stats?.total_power ?? 0;
  const kwh = usage?.estimated_kwh_today ?? null;
  const roomsCount = stats ? Object.keys(stats.room_power).length : 0;



const cards = [
  {
    label: "Total Power",
    value: `${total} W`,
    accent: "from-sky-500 to-indigo-500",
    icon: <FiZap className="h-6 w-6 text-black" />,
  },
  {
    label: "Estimated Today",
    value: kwh === null ? "—" : `${kwh} kWh`,
    accent: "from-emerald-500 to-teal-500",
    icon: <MdBatteryCharging20 className="h-6 w-6 text-black" />,
  },
  {
    label: "Rooms Tracked",
    value: `${roomsCount}`,
    accent: "from-violet-500 to-fuchsia-500",
    icon: <FaHome className="h-6 w-6 text-black" />,
  },
];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div
            className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 ${c.accent}`}
          />
          <div className="flex items-center gap-3">
            <div className="text-2xl">{c.icon}</div>
            <div className="text-sm font-medium text-slate-500">{c.label}</div>
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}