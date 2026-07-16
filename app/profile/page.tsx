import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import DeleteLapTimeButton from "@/components/DeleteLapTimeButton";
import LapTimeCard from "@/components/LapTimeCard";
import RoomCard from "@/components/RoomCard";
import { difficultyColorClass } from "@/lib/laptime";
import type { Profile, Room } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const { data: lapTimes } = await supabase
    .from("lap_times")
    .select("id, time_ms, suggested_difficulty, updated_at, tracks(id, name_zh, country)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const { data: overall } = await supabase
    .from("player_overall_difficulty")
    .select("overall_difficulty, tracks_count")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: myRooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Room[]>();

  const myRoomIds = (myRooms ?? []).map((r) => r.id);
  const { data: pendingApps } =
    myRoomIds.length > 0
      ? await supabase
          .from("room_applications")
          .select("room_id")
          .eq("status", "pending")
          .in("room_id", myRoomIds)
      : { data: [] as { room_id: number }[] };

  const pendingCountByRoom = new Map<number, number>();
  for (const a of pendingApps ?? []) {
    pendingCountByRoom.set(a.room_id, (pendingCountByRoom.get(a.room_id) ?? 0) + 1);
  }

  if (!profile) redirect("/login");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold">我的资料</h1>
        <div className="rounded-lg border border-border bg-surface p-6">
          <ProfileForm profile={profile} />
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">我的房间</h2>
          <Link
            href="/rooms/new"
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98]"
          >
            + 创建房间
          </Link>
        </div>

        {myRooms && myRooms.length > 0 ? (
          <div className="space-y-2">
            {myRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                hostNickname={profile.nickname}
                hideHost
                pendingCount={pendingCountByRoom.get(room.id) ?? 0}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            还没有创建任何房间，
            <Link href="/rooms/new" className="text-brand hover:underline">
              去创建一个
            </Link>
          </p>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">我的圈速</h2>
          <Link
            href="/laptimes/new"
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98]"
          >
            + 录入圈速
          </Link>
        </div>

        <div className="mb-4 rounded-lg border border-border bg-surface p-4">
          <span className="text-sm text-muted">综合建议难度</span>
          <div
            className={`text-3xl font-bold ${difficultyColorClass(
              overall?.overall_difficulty ?? null
            )}`}
          >
            {overall ? overall.overall_difficulty : "暂无数据"}
          </div>
          {overall && (
            <span className="text-xs text-muted">
              基于 {overall.tracks_count} 条赛道成绩
            </span>
          )}
        </div>

        {lapTimes && lapTimes.length > 0 ? (
          <div className="space-y-2">
            {lapTimes.map((lt) => {
              const track = Array.isArray(lt.tracks) ? lt.tracks[0] : lt.tracks;
              return (
                <LapTimeCard
                  key={lt.id}
                  trackName={track?.name_zh ?? ""}
                  country={track?.country ?? ""}
                  timeMs={lt.time_ms}
                  difficulty={lt.suggested_difficulty}
                  updatedAt={lt.updated_at}
                  action={<DeleteLapTimeButton lapTimeId={lt.id} />}
                />
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            还没有录入任何圈速，
            <Link href="/laptimes/new" className="text-brand hover:underline">
              去录入第一条
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
