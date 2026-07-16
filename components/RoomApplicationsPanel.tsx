"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { difficultyBadgeClass } from "@/lib/laptime";
import Avatar from "@/components/Avatar";
import type { ApplicationStatus, RoomType } from "@/lib/types";

export interface ApplicationRow {
  id: number;
  user_id: string;
  message: string | null;
  snapshot_difficulty: number | null;
  status: ApplicationStatus;
  created_at: string;
  nickname: string;
  platform: string;
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "待审批",
  accepted: "已通过",
  rejected: "已拒绝",
  withdrawn: "已撤回",
};

export default function RoomApplicationsPanel({
  roomId,
  roomType,
  minDifficulty,
  applications,
  isHost,
}: {
  roomId: number;
  roomType: RoomType;
  minDifficulty: number | null;
  applications: ApplicationRow[];
  isHost: boolean;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleAccept(applicationId: number) {
    setLoadingId(applicationId);
    const supabase = createClient();
    const { error } = await supabase
      .from("room_applications")
      .update({ status: "accepted" })
      .eq("id", applicationId);

    if (!error && roomType === "career_duo") {
      await supabase.from("rooms").update({ status: "closed" }).eq("id", roomId);
    }
    setLoadingId(null);
    router.refresh();
  }

  async function handleReject(applicationId: number) {
    setLoadingId(applicationId);
    const supabase = createClient();
    await supabase
      .from("room_applications")
      .update({ status: "rejected" })
      .eq("id", applicationId);
    setLoadingId(null);
    router.refresh();
  }

  const visible = applications.filter((a) => a.status !== "withdrawn");

  if (visible.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
        {roomType === "career_duo" ? "还没有人申请" : "还没有人报名"}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((app) => {
        const belowThreshold =
          minDifficulty !== null &&
          (app.snapshot_difficulty === null || app.snapshot_difficulty < minDifficulty);

        return (
          <div
            key={app.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border/60"
          >
            <div className="flex min-w-0 items-start gap-3">
              <Avatar name={app.nickname} size="sm" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{app.nickname}</span>
                  <span className="text-xs text-muted">{app.platform}</span>
                  <span
                    className={
                      belowThreshold
                        ? "inline-flex items-center rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400"
                        : difficultyBadgeClass(app.snapshot_difficulty)
                    }
                  >
                    综合难度 {app.snapshot_difficulty ?? "暂无数据"}
                  </span>
                  {belowThreshold && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">
                      未达标
                    </span>
                  )}
                </div>
                {app.message && (
                  <p className="mt-1 text-sm text-muted">「{app.message}」</p>
                )}
                <span className="text-xs text-muted">
                  {STATUS_LABEL[app.status]} · {new Date(app.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
            </div>

            {isHost && app.status === "pending" && (
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => handleAccept(app.id)}
                  disabled={loadingId === app.id}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  通过
                </button>
                <button
                  onClick={() => handleReject(app.id)}
                  disabled={loadingId === app.id}
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
                >
                  拒绝
                </button>
              </div>
            )}

            {isHost && app.status === "accepted" && roomType === "grand_prix" && (
              <button
                onClick={() => handleReject(app.id)}
                disabled={loadingId === app.id}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                移除
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
