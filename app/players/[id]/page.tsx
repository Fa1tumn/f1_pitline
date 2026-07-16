import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { difficultyColorClass } from "@/lib/laptime";
import Avatar from "@/components/Avatar";
import LapTimeCard from "@/components/LapTimeCard";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: lapTimes } = await supabase
    .from("lap_times")
    .select("id, time_ms, suggested_difficulty, updated_at, tracks(name_zh, country)")
    .eq("user_id", id)
    .order("suggested_difficulty", { ascending: false });

  const { data: overall } = await supabase
    .from("player_overall_difficulty")
    .select("overall_difficulty, tracks_count")
    .eq("user_id", id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile.nickname} />
          <div>
            <h1 className="text-2xl font-bold">{profile.nickname}</h1>
            <p className="mt-0.5 text-sm text-muted">
              平台：{profile.platform} · 加入时间：
              {new Date(profile.created_at).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <span className="text-sm text-muted">综合建议难度</span>
          <div
            className={`text-3xl font-bold ${difficultyColorClass(
              overall?.overall_difficulty ?? null
            )}`}
          >
            {overall ? overall.overall_difficulty : "暂无数据"}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">赛道圈速</h2>
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
                />
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            还没有录入任何圈速
          </p>
        )}
      </div>
    </div>
  );
}
