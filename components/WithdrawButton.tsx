"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function WithdrawButton({ applicationId }: { applicationId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleWithdraw() {
    if (!confirm("确定要撤回吗？")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("room_applications")
      .update({ status: "withdrawn" })
      .eq("id", applicationId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleWithdraw}
      disabled={loading}
      className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
    >
      {loading ? "撤回中..." : "撤回申请"}
    </button>
  );
}
