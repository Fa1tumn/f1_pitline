import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RoomFilters from "@/components/RoomFilters";
import RoomCard from "@/components/RoomCard";
import type { Platform, Room, RoomType } from "@/lib/types";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; platform?: string; maxDiff?: string }>;
}) {
  const params = await searchParams;
  const type: RoomType = params.type === "grand_prix" ? "grand_prix" : "career_duo";
  const platform = (params.platform as Platform | undefined) || undefined;
  const maxDiff = params.maxDiff ? Number(params.maxDiff) : undefined;

  const supabase = await createClient();

  let query = supabase
    .from("rooms")
    .select("*")
    .eq("type", type)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (platform) query = query.eq("platform", platform);
  if (maxDiff !== undefined && !Number.isNaN(maxDiff)) {
    query = query.or(`min_difficulty.is.null,min_difficulty.lte.${maxDiff}`);
  }

  const { data: rooms } = await query.returns<Room[]>();

  const hostIds = [...new Set((rooms ?? []).map((r) => r.host_id))];
  const { data: hosts } =
    hostIds.length > 0
      ? await supabase
          .from("public_profiles")
          .select("id, nickname")
          .in("id", hostIds)
      : { data: [] as { id: string; nickname: string }[] };
  const hostMap = new Map((hosts ?? []).map((h) => [h.id, h.nickname]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">房间列表</h1>
        <Link
          href="/rooms/new"
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98]"
        >
          + 创建房间
        </Link>
      </div>

      <RoomFilters type={type} />

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
          暂无符合条件的房间
        </p>
      )}
    </div>
  );
}
