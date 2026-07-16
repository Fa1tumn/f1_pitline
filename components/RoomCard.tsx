import Link from "next/link";
import { difficultyBadgeClass } from "@/lib/laptime";
import Avatar from "@/components/Avatar";
import type { Room } from "@/lib/types";

export default function RoomCard({
  room,
  hostNickname,
  hideHost = false,
  pendingCount = 0,
}: {
  room: Room;
  hostNickname: string;
  hideHost?: boolean;
  pendingCount?: number;
}) {
  const isEnded = room.event_time ? new Date(room.event_time) < new Date() : false;
  const isClosed = room.status === "closed";

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group flex gap-3 rounded-lg border border-border bg-surface p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand hover:shadow-lg hover:shadow-black/20"
    >
      {!hideHost && <Avatar name={hostNickname} size="sm" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
              {room.type === "career_duo" ? "双人生涯" : "大奖赛"}
            </span>
            <h3 className="mt-1 truncate font-semibold text-foreground transition-colors group-hover:text-brand">
              {room.title}
            </h3>
          </div>
          <div className="flex shrink-0 gap-1">
            {pendingCount > 0 && (
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand">
                {pendingCount} 待审批
              </span>
            )}
            {isClosed && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                已成团
              </span>
            )}
            {isEnded && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                已结束
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          {!hideHost && <span>房主：{hostNickname}</span>}
          <span>平台：{room.platform}</span>
          {room.min_difficulty !== null && (
            <span className={difficultyBadgeClass(room.min_difficulty)}>
              难度门槛 {room.min_difficulty}
            </span>
          )}
          {room.event_time && (
            <span>比赛时间：{new Date(room.event_time).toLocaleString("zh-CN")}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
