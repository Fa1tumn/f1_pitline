import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoomForm from "@/components/RoomForm";

export default async function NewRoomPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("is_active", true)
    .order("id");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">创建房间</h1>
      <div className="rounded-lg border border-border bg-surface p-6">
        <RoomForm hostId={user.id} tracks={tracks ?? []} />
      </div>
    </div>
  );
}
