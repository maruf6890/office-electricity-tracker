import React from "react";
import TimelineChart from "./TimeLineChart";


interface TimelinePoint {
  time: string;
  power: number;
}

interface CostData {
  today_kwh: number;
  today_cost: number;
  monthly_projection: number;
  per_unit_cost: number;
}

async function getTimeline(): Promise<TimelinePoint[] | null> {
  try {
    const res = await fetch("http://127.0.0.1:8000/timeline", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return null;
  }
}

async function getCost(): Promise<CostData | null> {
  try {
    const res = await fetch("http://127.0.0.1:8000/cost", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error fetching cost:", error);
    return null;
  }
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default async function Page() {
  const [timeline, cost] = await Promise.all([getTimeline()?? [{ time: "", power: 0 }], getCost() ?? { today_kwh: 0, today_cost: 0, monthly_projection: 0, per_unit_cost: 0 }]);

  if (!timeline || !cost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-red-600 font-medium">
            Unable to load dashboard data. Please make sure the API server is
            running.
          </p>
        </div>
      </div>
    );
  }

  const peak = timeline.reduce(
    (max, p) => (p.power > max.power ? p : max),
    timeline[0],
  );
  const avg = timeline.reduce((sum, p) => sum + p.power, 0) / timeline.length;

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className=" space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Energy Usage</h1>
          <p className="text-sm text-gray-500 mt-1">
            Live power usage and cost overview
          </p>
        </div>

        {/* Cost stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Today's Usage" value={`${cost.today_kwh} kWh`} />
          <StatCard label="Today's Cost" value={`${cost.today_cost} BDT`} />
          <StatCard
            label="Monthly Projection"
            value={`${cost.monthly_projection} BDT`}
          />
          <StatCard
            label="Per Unit Cost"
            value={`${cost.per_unit_cost} BDT/kWh`}
          />
        </div>

        {/* Power stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Peak Power"
            value={`${peak?.power || 0} W`}
            sub={peak?.time || "—" }
          />
          <StatCard label="Average Power" value={`${avg?.toFixed(1) || 0} W`} />
          <StatCard label="Readings Tracked" value={`${timeline?.length || 0}`} />
        </div>

        {/* Timeline chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold mb-4 text-gray-700">
            POWER TIMELINE (W)
          </h3>
          <TimelineChart data={timeline} />
        </div>
      </div>
    </div>
  );
}
