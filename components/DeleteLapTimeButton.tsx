"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteLapTimeButton({ lapTimeId }: { lapTimeId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("确定删除这条圈速记录吗？")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("lap_times").delete().eq("id", lapTimeId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-muted transition-colors hover:text-danger disabled:opacity-50"
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}
