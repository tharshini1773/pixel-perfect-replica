/**
 * Supabase Connection Status Badge
 * Shows a live connection indicator in the admin dashboard header.
 * Phase 5: Dashboard live data integration.
 */

import { useState, useEffect } from "react";
import { Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { checkSupabaseConnection, SUPABASE_URL } from "@/lib/supabase";
import { fetchDashboardStats, type DashboardStats } from "@/lib/supabaseService";

interface SupabaseStatusProps {
  compact?: boolean;
  onStatsLoaded?: (stats: DashboardStats) => void;
}

export function SupabaseStatus({ compact = false, onStatsLoaded }: SupabaseStatusProps) {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking");
  const [latency, setLatency] = useState<string>("");
  const [tablesReady, setTablesReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function probe() {
      const start = performance.now();
      const result = await checkSupabaseConnection();
      const ms = Math.round(performance.now() - start);

      if (!isMounted) return;

      if (result.connected) {
        setStatus("connected");
        setLatency(`${ms}ms`);
      } else {
        setStatus("error");
      }

      // Fetch dashboard stats if connected
      const stats = await fetchDashboardStats();
      if (!isMounted) return;
      setTablesReady(stats.connected && stats.totalProducts > 0);
      if (onStatsLoaded) onStatsLoaded(stats);
    }

    probe();
    return () => { isMounted = false; };
  }, []);

  if (compact) {
    if (status === "checking") {
      return (
        <span className="inline-flex items-center gap-1 text-[0.68rem] text-[#8C7A70]">
          <Loader2 className="h-3 w-3 animate-spin" />
          Supabase…
        </span>
      );
    }
    if (status === "connected") {
      return (
        <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Supabase {latency}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-amber-700">
        <AlertCircle className="h-3 w-3" />
        Supabase offline
      </span>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 text-xs ${
        status === "connected"
          ? "border-emerald-200 bg-emerald-50/60"
          : status === "error"
          ? "border-amber-200 bg-amber-50/60"
          : "border-[#EFE4DB] bg-[#FAF7F2]"
      }`}
    >
      <div className="flex items-center gap-2">
        {status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-[#8C7A70]" />}
        {status === "connected" && <CheckCircle2 className="h-4 w-4 text-emerald-700" />}
        {status === "error" && <AlertCircle className="h-4 w-4 text-amber-700" />}
        <Database className="h-4 w-4 text-[#8C7A70]" />
        <div>
          <p className="font-bold text-[#1A100C]">
            {status === "checking" && "Connecting to Supabase…"}
            {status === "connected" && `Supabase Connected · ${latency}`}
            {status === "error" && "Supabase Offline (Using local data)"}
          </p>
          <p className="text-[0.68rem] text-[#8C7A70] mt-0.5">
            {status === "connected"
              ? tablesReady
                ? `${SUPABASE_URL} · Tables: Ready · RLS: Enabled`
                : `${SUPABASE_URL} · Run migrations to populate tables`
              : "Check Supabase project or run SQL migration in the dashboard."}
          </p>
        </div>
      </div>
    </div>
  );
}
