"use client";
import { Activity, BarChart3, Brain, DollarSign, Loader2 } from "lucide-react";
import { usePathname } from "next/dist/client/components/navigation";
import Link from "next/link";
import React, { useEffect } from "react";


export default function Sidebar() {
    const pathname = usePathname();
    console.log("Current pathname:", pathname);
    const isActiveRoute = (path: string) => pathname === path;
    const activeClass = "text-black bg-gray-200 rounded-sm px-3 py-2";
    const [loading, setLoading] = React.useState<string | null>(null);

    const onRedirect = (path: string) => {
        if (pathname !== path) {
            setLoading(path);
        }
    }
     useEffect(() => {
       if (pathname !== "/") {
         localStorage.removeItem("reloaded");
       }
     }, [pathname]);
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(null);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

  return (
    <div className="">
      {/* Navigation and other content can go here. */}
      <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
        <Link href="/"  onClick={() => onRedirect("/")} >
          <span className={`flex items-center gap-2 hover:text-black ${isActiveRoute("/") ? activeClass : ""}`}>
            {loading === "/" ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
            Live Overview
                </span>
              </Link>
              <Link href="/history" onClick={() => onRedirect("/history")}>
                <span className={`flex items-center gap-2 hover:text-black ${isActiveRoute("/history") ? activeClass : ""}`}>
                  {loading === "/history" ? <Loader2 size={18} className="animate-spin" /> : <BarChart3 size={18} />}
                  Power History
                </span>
              </Link>
              <Link href="/usage" onClick={() => onRedirect("/usage")}>
                <span className={`flex items-center gap-2 hover:text-black ${isActiveRoute("/usage") ? activeClass : ""}`}>
                  {loading === "/usage" ? <Loader2 size={18} className="animate-spin" /> : <DollarSign size={18} />}
                  Usage & Costs
                </span>
              </Link>
              
              <Link href="/ai-insights" onClick={() => onRedirect("/ai-insights")}>
                <span className={`flex items-center gap-2 hover:text-black ${isActiveRoute("/ai-insights") ? activeClass : ""}`}>
                  {loading === "/ai-insights" ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
                  AI Summary
                </span>
              </Link>
          </div>
    </div>
  )
}
