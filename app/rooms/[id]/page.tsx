import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoomApplyForm from "@/components/RoomApplyForm";
import WithdrawButton from "@/components/WithdrawButton";
import RoomApplicationsPanel, {
  type ApplicationRow,
} from "@/components/RoomApplicationsPanel";
import { difficultyColorClass } from "@/lib/laptime";
import type { Room, RoomApplication } from "@/lib/types";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roomId = Number(id);
  if (!Number.isInteger(roomId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single<Room>();

  if (!room) notFound();

  const { data: host } = await supabase
    .from("public_profiles")
    .select("nickname, platform")
    .eq("id", room.host_id)
    .single();

  const { data: track } = room.track_id
    ? await supabase
        .from("tracks")
        .select("name_zh, country")
        .eq("id", room.track_id)
        .single()
    : { data: null };

  const { data: applications } = await supabase
    .from("room_applications")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .returns<RoomApplication[]>();

  const applicantIds = [...new Set((applications ?? []).map((a) => a.user_id))];
  const { data: applicantProfiles } =
    applicantIds.length > 0
      ? await supabase
          .from("public_profiles")
          .select("id, nickname, platform")
          .in("id", applicantIds)
      : { data: [] as { id: string; nickname: string; platform: string }[] };
  const applicantMap = new Map(
    (applicantProfiles ?? []).map((p) => [p.id, p])
  );

  const isHost = user?.id === room.host_id;
  const myApplication =
    applications?.find((a) => a.user_id === user?.id) ?? null;

  let roomCode: string | null = null;
  if (room.type === "grand_prix" && user) {
    const { data } = await supabase.rpc("get_room_code", {
      p_room_id: roomId,
    });
    roomCode = data ?? null;
  }

  let partnerQQ: string | null = null;
  if (room.type === "career_duo" && user) {
    const { data } = await supabase.rpc("get_partner_qq", {
      p_room_id: roomId,
    });
    partnerQQ = data && data.length > 0 ? data[0].qq : null;
  }

  const isExpired = new Date(room.expires_at) < new Date();
  const isEnded = room.event_time ? new Date(room.event_time) < new Date() : false;
  const canApply =
    !!user && !isHost && !myApplication && room.status === "open" && !isExpired;

  const applicationRows: ApplicationRow[] = (applications ?? [])
    .map((a) => {
      const p = applicantMap.get(a.user_id);
      return {
        id: a.id,
        user_id: a.user_id,
        message: a.message,
        snapshot_difficulty: a.snapshot_difficulty,
        status: a.status,
        created_at: a.created_at,
        nickname: p?.nickname ?? "未知车手",
        platform: p?.platform ?? "",
      };
    })
    .filter(
      (a) => isHost || room.type === "grand_prix" || a.user_id === user?.id
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{room.title}</h1>
          <div className="flex shrink-0 gap-1">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
              {room.type === "career_duo" ? "双人生涯" : "大奖赛"}
            </span>
            {room.status === "closed" && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                已成团
              </span>
            )}
            {isEnded && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                已结束
              </span>
            )}
            {isExpired && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                已过期
              </span>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">
          房主：
          <Link href={`/players/${room.host_id}`} className="text-brand hover:underline">
            {host?.nickname ?? "未知车手"}
          </Link>
          {" · "}平台：{room.platform}
        </p>
      </div>

      {room.description && (
        <p className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm text-foreground/90">
          {room.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        {room.min_difficulty !== null && (
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="text-xs text-muted">难度门槛</div>
            <div className={`font-semibold ${difficultyColorClass(room.min_difficulty)}`}>
              {room.min_difficulty}
            </div>
          </div>
        )}
        {room.event_time && (
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="text-xs text-muted">比赛时间</div>
            <div className="font-semibold">
              {new Date(room.event_time).toLocaleString("zh-CN")}
            </div>
          </div>
        )}
        {track && (
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="text-xs text-muted">赛道</div>
            <div className="font-semibold">
              {track.name_zh}（{track.country}）
            </div>
          </div>
        )}
        {room.type === "grand_prix" && (
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="text-xs text-muted">最大人数</div>
            <div className="font-semibold">{room.max_players}</div>
          </div>
        )}
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="text-xs text-muted">有效期至</div>
          <div className="font-semibold">
            {new Date(room.expires_at).toLocaleDateString("zh-CN")}
          </div>
        </div>
      </div>

      {roomCode && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          Oopz / KOOK 房间码：
          <span className="ml-2 font-mono font-semibold text-emerald-400">{roomCode}</span>
        </div>
      )}

      {partnerQQ && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          组队成功，对方 QQ：
          <span className="ml-2 font-mono font-semibold text-emerald-400">{partnerQQ}</span>
        </div>
      )}

      {!user && (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted">
          <Link href="/login" className="text-brand hover:underline">
            登录
          </Link>
          {room.type === "career_duo" ? " 后可申请加入" : " 后可报名"}
        </p>
      )}

      {isHost && (
        <p className="rounded-lg border border-dashed border-brand/40 bg-brand/10 p-3 text-center text-sm text-brand">
          这是你创建的房间
        </p>
      )}

      {canApply && (
        <RoomApplyForm
          roomId={room.id}
          userId={user!.id}
          actionLabel={room.type === "career_duo" ? "申请加入" : "立即报名"}
        />
      )}

      {myApplication && !isHost && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 text-sm">
          <span>
            我的{room.type === "career_duo" ? "申请" : "报名"}状态：
            <span className="ml-1 font-semibold">
              {
                { pending: "待审批", accepted: "已通过", rejected: "已拒绝", withdrawn: "已撤回" }[
                  myApplication.status
                ]
              }
            </span>
          </span>
          {(myApplication.status === "pending" || myApplication.status === "accepted") && (
            <WithdrawButton applicationId={myApplication.id} />
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-bold">
          {room.type === "career_duo" ? "申请列表" : "报名列表"}
        </h2>
        <RoomApplicationsPanel
          roomId={room.id}
          roomType={room.type}
          minDifficulty={room.min_difficulty}
          applications={applicationRows}
          isHost={isHost}
        />
        {!isHost && room.type === "career_duo" && (
          <p className="mt-2 text-xs text-muted">
            出于隐私考虑，此处仅显示你自己的申请记录，完整名单仅房主可见。
          </p>
        )}
      </div>
    </div>
  );
}
