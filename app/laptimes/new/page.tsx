import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LapTimeForm from "@/components/LapTimeForm";

export default async function NewLapTimePage() {
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

  const { data: existing } = await supabase
    .from("lap_times")
    .select("track_id, time_ms")
    .eq("user_id", user.id);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">录入圈速</h1>
      <div className="rounded-lg border border-border bg-surface p-6">
        <LapTimeForm userId={user.id} tracks={tracks ?? []} existing={existing ?? []} />
      </div>
    </div>
  );
}
