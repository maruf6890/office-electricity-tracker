import { DollarSign, Lightbulb, PieChart, Recycle } from "lucide-react";
import React from "react";

interface AiSummaryResponse {
  usage_insights: string[];
  waste_insights: string[];
  cost_insights: string[];
  overall_status: string;
  recommendation: string[];
}

export const IconMap = {
  usage_insights: <PieChart className="w-4 h-4" />,
  waste_insights: <Recycle className="w-4 h-4" />,
  cost_insights: <DollarSign className="w-4 h-4" />,
  recommendation: <Lightbulb className="w-4 h-4" />,
};
async function getAiSummary(): Promise<AiSummaryResponse | null> {
  try {
    const res = await fetch("http://127.0.0.1:8000/ai-summary", {
      cache: "no-store", 
    });
    console.log("AI Summary API response status:", res); // Log the response status for debugging
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching AI summary:", error);
    return null;
  }
}

function StatusBadge({ status }: { status: string }) {
  const isHigh = status.toLowerCase().includes("high");
  const colorClasses = isHigh
    ? "bg-red-100 text-red-700 border-red-300"
    : "bg-green-100 text-green-700 border-green-300";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colorClasses}`}
    >
      {status}
    </span>
  );
}

function InsightCard({
  title,
  items,
accentColor,
  icon
}: {
  title: string;
  items: string[];
        accentColor: string;
  icon:string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className={`text-sm uppercase flex items-center gap-1 font-semibold mb-3 ${accentColor}`}>{IconMap[icon as keyof typeof IconMap]} {title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex gap-2 text-sm text-gray-700 leading-relaxed"
          >
            <span className="text-gray-400 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Page() {
    const data = await getAiSummary();
    console.log("Fetched AI Summary:", data); // Log the fetched data for debugging

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-red-600 font-medium">
            Unable to load AI summary. Please make sure the API server is
            running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 ">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="">
            <h1 className="text-lg font-bold text-gray-900">
              Office Energy AI Summary
            </h1>

            <p className="text-sm text-gray-500">
              Insights and recommendations based on energy usage data.
            </p>
          </div>

          <StatusBadge status={data.overall_status} />
        </div>

        {/* Insight cards grid */}
        <div className="grid grid-cols-1  gap-4">
          <InsightCard
            title="USAGE INSIGHTS"
            items={data?.usage_insights || []}
            accentColor="text-black"
            icon="usage_insights"
          />
          <InsightCard
            title="WASTE INSIGHTS"
            items={data?.waste_insights || []}
                      accentColor="text-black"
                      icon="waste_insights"
          />
          <InsightCard
            title="COST INSIGHTS"
            items={data?.cost_insights || []}
            accentColor="text-black"
            icon="cost_insights"
          />
          <InsightCard
            title="Recommendations"
            items={data?.recommendation || []}
                      accentColor="text-black"
                        icon="recommendation"
          />
        </div>
      </div>
    </div>
  );
}
