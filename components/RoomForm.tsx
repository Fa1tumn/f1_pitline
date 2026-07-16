"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Platform, RoomType, Track } from "@/lib/types";

const PLATFORMS: Platform[] = ["PC", "PS", "Xbox"];
const inputClass = "w-full rounded-md border px-3 py-2 text-sm";

export default function RoomForm({ hostId, tracks }: { hostId: string; tracks: Track[] }) {
  const router = useRouter();
  const [type, setType] = useState<RoomType>("career_duo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState<Platform>("PC");
  const [minDifficulty, setMinDifficulty] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [trackId, setTrackId] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("20");
  const [voiceRoomCode, setVoiceRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 1 || title.trim().length > 50) {
      setError("标题长度需为 1-50 个字符");
      return;
    }
    if (type === "grand_prix" && !eventTime) {
      setError("请填写比赛时间");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("rooms")
      .insert({
        type,
        host_id: hostId,
        title: title.trim(),
        description: description.trim() || null,
        platform,
        min_difficulty: minDifficulty === "" ? null : Number(minDifficulty),
        max_players: type === "career_duo" ? 2 : Number(maxPlayers),
        event_time: type === "grand_prix" && eventTime ? new Date(eventTime).toISOString() : null,
        track_id: type === "grand_prix" && trackId ? Number(trackId) : null,
        voice_room_code: type === "grand_prix" ? voiceRoomCode.trim() || null : null,
      })
      .select("id")
      .single();
    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/rooms/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted">房间类型</label>
        <div className="flex gap-2">
          {(
            [
              { value: "career_duo", label: "双人生涯招募" },
              { value: "grand_prix", label: "大奖赛" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                type === opt.value
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface text-muted hover:bg-surface-2"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          required
          className={inputClass}
          placeholder={type === "career_duo" ? "招募生涯队友" : "周末大奖赛"}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">描述 / 要求</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={4}
          className={inputClass}
          placeholder={
            type === "career_duo"
              ? "生涯设置说明、对队友的要求……"
              : "赛制规则说明……"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">平台</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className={inputClass}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">
            难度门槛（可空，软门槛）
          </label>
          <input
            type="number"
            min={0}
            max={110}
            value={minDifficulty}
            onChange={(e) => setMinDifficulty(e.target.value)}
            className={inputClass}
            placeholder="不限"
          />
        </div>
      </div>

      {type === "grand_prix" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-muted">比赛时间</label>
              <input
                type="datetime-local"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">最大人数</label>
              <input
                type="number"
                min={2}
                max={22}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">赛道（可选）</label>
            <select
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className={inputClass}
            >
              <option value="">不限定</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name_zh}（{t.country}）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">
              Oopz / KOOK 房间码（仅报名成功者可见）
            </label>
            <input
              type="text"
              value={voiceRoomCode}
              onChange={(e) => setVoiceRoomCode(e.target.value)}
              maxLength={50}
              className={inputClass}
            />
          </div>
        </>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "创建中..." : "创建房间"}
      </button>
    </form>
  );
}
