import type { ReactNode } from "react";
import { formatLapTime, difficultyBadgeClass } from "@/lib/laptime";

export default function LapTimeCard({
  trackName,
  country,
  timeMs,
  difficulty,
  updatedAt,
  action,
}: {
  trackName: string;
  country: string;
  timeMs: number;
  difficulty: number;
  updatedAt?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-colors hover:border-brand/40">
      <div>
        <div className="font-medium">
          {trackName}
          <span className="ml-1.5 text-xs text-muted">{country}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm">
          <span className="font-mono text-muted">{formatLapTime(timeMs)}</span>
          {updatedAt && (
            <span className="text-xs text-muted">
              {new Date(updatedAt).toLocaleDateString("zh-CN")}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={difficultyBadgeClass(difficulty)}>{difficulty}</span>
        {action}
      </div>
    </div>
  );
}
