"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RoomApplyForm({
  roomId,
  userId,
  actionLabel,
}: {
  roomId: number;
  userId: string;
  actionLabel: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("room_applications").insert({
      room_id: roomId,
      user_id: userId,
      message: message.trim() || null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={200}
        rows={3}
        placeholder="给房主留一句话（可选）"
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "提交中..." : actionLabel}
      </button>
    </form>
  );
}
