"use client";

import type { Alert } from "@/lib/api_helper";
import { format } from "date-fns";
import { OctagonAlert, TriangleAlert } from "lucide-react";

interface Props {
  alerts: Alert[];
}



export default function AlertsPanel({ alerts }: Props) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 mb-10">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-base flex items-center gap-1 font-semibold text-slate-900">
          <TriangleAlert className="inline-block h-5 w-5" />
          <span className=" text-lg">Alerts</span>
        </h3>
        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
          {alerts.length}
        </span>
      </header>

      {alerts.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          All clear. No active alerts.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {alerts
            .slice()
            .reverse()
            .map((a, i) => (
              <li
                key={`${a.timestamp}-${i}`}
                className="flex items-start gap-3 py-3"
              >
                <OctagonAlert className="mt-0.5 size-4  text-rose-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800 capitalize">
                    {a.message}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">
                    {a.type.replace(/_/g, " ")} · {format(new Date(a.timestamp), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}