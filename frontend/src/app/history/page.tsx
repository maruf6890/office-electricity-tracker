import React from "react";
import HistoryChart from "./HistoryChart";
import { format } from "date-fns";


interface HistoryEntry {
  timestamp: string;
  total_power: number;
  drawing_room: number;
  work1: number;
  work2: number;
}

interface HistoryResponse {
  history: HistoryEntry[];
  peak: HistoryEntry;
  average: number;
}
const EMPTY_HISTORY: HistoryResponse = {
  history: [],
  peak: {
    timestamp: "",
    total_power: 0,
    drawing_room: 0,
    work1: 0,
    work2: 0,
  },
  average: 0,
};

async function getHistory(): Promise<HistoryResponse | null> {
  try {
    const res = await fetch("http://127.0.0.1:8000/history", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching history:", error);
    return EMPTY_HISTORY;
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
      <p className="text-xl font-bold text-gray-900 mt-1" dangerouslySetInnerHTML={{ __html: value }} />
      {sub && <p className="text-sm text-gray-900 mt-1">{sub}</p>}
    </div>
  );
}

export default async function Page() {
  const data = (await getHistory()) ?? EMPTY_HISTORY;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-red-600 font-medium">
            Unable to load power history. Please make sure the API server is
            running.
          </p>
        </div>
      </div>
    );
  }

 const latest = data.history.at(-1) ?? {
   total_power: 0,
   drawing_room: 0,
   work1: 0,
   work2: 0,
   timestamp: "",
 };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className=" space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {" "}
            Power Usage History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.history.length} readings tracked
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Current Total" value={`${latest.total_power} W`} />
          <StatCard label="Average" value={`${data.average.toFixed(1)} W`} />
          <StatCard
            label="Peak"
            value={`${data?.peak?.total_power || 0} W`}
            sub={data.peak?.timestamp ? format(new Date(data.peak.timestamp), "PPpp") : "—"}
          />
          <StatCard
            label="Peak Breakdown"
            value={`DR ${data?.peak?.drawing_room || 0} - W1 ${data?.peak?.work1 || 0} - W2 ${data?.peak?.work2 || 0}`}
          />
        </div>

        {/* Chart (client component) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold mb-4 text-gray-700">
            POWER OVER TIME (W)
          </h3>
          <HistoryChart history={data.history} />
        </div>

        {/* Raw table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold mb-4 text-gray-700">READINGS</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Drawing Room</th>
                <th className="py-2 pr-4">Work 1</th>
                <th className="py-2 pr-4">Work 2</th>
              </tr>
            </thead>
            <tbody>
              {data.history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No readings available.
                  </td>
                </tr>
              ) : (
                <>
                  {data.history.map((entry) => (
                    <tr
                      key={entry.timestamp}
                      className="border-b border-gray-100 text-gray-700"
                    >
                      <td className="py-2 pr-4">
                        {entry.timestamp? format(new Date(entry.timestamp), "PPpp") : "—"}
                      </td>
                      <td className="py-2 pr-4 font-medium">
                        {entry.total_power} W
                      </td>
                      <td className="py-2 pr-4">{entry.drawing_room} W</td>
                      <td className="py-2 pr-4">{entry.work1} W</td>
                      <td className="py-2 pr-4">{entry.work2} W</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
