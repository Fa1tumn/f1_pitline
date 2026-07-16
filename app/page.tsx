import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RoomCard from "@/components/RoomCard";
import HeroBackground from "@/components/HeroBackground";
import type { Room } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("status", "open")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(6)
    .returns<Room[]>();

  const hostIds = [...new Set((rooms ?? []).map((r) => r.host_id))];
  const { data: hosts } =
    hostIds.length > 0
      ? await supabase.from("public_profiles").select("id, nickname").in("id", hostIds)
      : { data: [] as { id: string; nickname: string }[] };
  const hostMap = new Map((hosts ?? []).map((h) => [h.id, h.nickname]));

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-2xl px-4 pb-10 pt-12 text-center">
        <HeroBackground />
        <div className="relative">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            F1 25 车手社区 · Equal Performance
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            PitLane
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            录入你的 Time Trial 圈速，获取 AI 难度建议；招募双人生涯队友；组织大奖赛，找到实力相当的对手。
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/laptimes/new"
              className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98]"
            >
              录入圈速
            </Link>
            <Link
              href="/rooms"
              className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface-2"
            >
              浏览房间
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-2 h-1 w-8 rounded-full bg-brand" />
          <h3 className="font-semibold">TT 圈速 + AI 难度</h3>
          <p className="mt-1 text-sm text-muted">
            手动录入等性能模式圈速，系统按比例缩放公式计算建议 AI 难度（0-110）。
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-2 h-1 w-8 rounded-full bg-brand" />
          <h3 className="font-semibold">双人生涯招募</h3>
          <p className="mt-1 text-sm text-muted">
            发布招募帖，审批申请，组队成功后互换 QQ 号。
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-2 h-1 w-8 rounded-full bg-brand" />
          <h3 className="font-semibold">大奖赛房间</h3>
          <p className="mt-1 text-sm text-muted">
            创建比赛房间，设置难度门槛，Oopz/KOOK 房间码报名后可见。
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">最新房间</h2>
          <Link href="/rooms" className="text-sm text-brand hover:underline">
            查看全部 →
          </Link>
        </div>
        {rooms && rooms.length > 0 ? (
          <div className="space-y-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                hostNickname={hostMap.get(room.host_id) ?? "未知车手"}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted">
            暂无房间，
            <Link href="/rooms/new" className="text-brand hover:underline">
              创建第一个
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
