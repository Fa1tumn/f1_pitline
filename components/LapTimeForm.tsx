"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  calcDifficulty,
  calcDifficultyFromCurve,
  difficultyColorClass,
  formatLapTime,
  MAX_TIME_MS,
  MIN_TIME_MS,
} from "@/lib/laptime";
import type { Track } from "@/lib/types";

interface ExistingEntry {
  track_id: number;
  time_ms: number;
}

const inputClass = "w-full rounded-md border px-2 py-2 text-center text-lg font-mono";

export default function LapTimeForm({
  userId,
  tracks,
  existing,
}: {
  userId: string;
  tracks: Track[];
  existing: ExistingEntry[];
}) {
  const router = useRouter();
  const [trackId, setTrackId] = useState<number>(tracks[0]?.id ?? 0);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [millis, setMillis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const secondsRef = useRef<HTMLInputElement>(null);
  const millisRef = useRef<HTMLInputElement>(null);

  const track = tracks.find((t) => t.id === trackId);
  const existingForTrack = existing.find((e) => e.track_id === trackId);

  const filledIn = minutes !== "" && seconds !== "" && millis !== "";
  const secondsValid = seconds === "" || Number(seconds) <= 59;

  const parsedMs = useMemo(() => {
    if (!filledIn || !secondsValid) return null;
    const total = Number(minutes) * 60_000 + Number(seconds) * 1_000 + Number(millis);
    if (total < MIN_TIME_MS || total > MAX_TIME_MS) return null;
    return total;
  }, [filledIn, secondsValid, minutes, seconds, millis]);

  const previewDifficulty =
    track && parsedMs !== null
      ? track.difficulty_curve_ms && track.difficulty_curve_ms.length === 111
        ? calcDifficultyFromCurve(track.difficulty_curve_ms, parsedMs)
        : calcDifficulty(track.baseline_difficulty, track.baseline_time_ms, parsedMs)
      : null;

  function handleMinutesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 1);
    setMinutes(digitsOnly);
    if (digitsOnly.length === 1) secondsRef.current?.focus();
  }

  function handleSecondsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 2);
    setSeconds(digitsOnly);
    if (digitsOnly.length === 2) millisRef.current?.focus();
  }

  function handleMillisChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 3);
    setMillis(digitsOnly);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!track || parsedMs === null) {
      setError("请输入正确的圈速，秒需在 0-59 之间，总时长需在 0:40.000 ~ 5:00.000 之间");
      return;
    }

    if (existingForTrack && parsedMs > existingForTrack.time_ms) {
      const confirmed = confirm(
        `你在该赛道已有更快的成绩 ${formatLapTime(
          existingForTrack.time_ms
        )}，新成绩 ${formatLapTime(parsedMs)} 更慢，确定要覆盖吗？`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: upsertError } = await supabase
      .from("lap_times")
      .upsert(
        { user_id: userId, track_id: track.id, time_ms: parsedMs },
        { onConflict: "user_id,track_id" }
      );
    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setSuccess(true);
    setMinutes("");
    setSeconds("");
    setMillis("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted">赛道</label>
        <select
          value={trackId}
          onChange={(e) => setTrackId(Number(e.target.value))}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name_zh}（{t.country}）
            </option>
          ))}
        </select>
        {existingForTrack && (
          <p className="mt-1 text-xs text-muted">
            当前最好成绩：{formatLapTime(existingForTrack.time_ms)}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">圈速</label>
        <div className="flex items-end gap-1">
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              value={minutes}
              onChange={handleMinutesChange}
              placeholder="1"
              maxLength={1}
              required
              className={inputClass}
            />
            <p className="mt-1 text-center text-xs text-muted">分</p>
          </div>
          <span className="pb-6 text-lg text-muted">:</span>
          <div className="flex-1">
            <input
              ref={secondsRef}
              type="text"
              inputMode="numeric"
              value={seconds}
              onChange={handleSecondsChange}
              placeholder="27"
              maxLength={2}
              required
              className={inputClass}
            />
            <p className="mt-1 text-center text-xs text-muted">秒</p>
          </div>
          <span className="pb-6 text-lg text-muted">.</span>
          <div className="flex-[1.2]">
            <input
              ref={millisRef}
              type="text"
              inputMode="numeric"
              value={millis}
              onChange={handleMillisChange}
              placeholder="456"
              maxLength={3}
              required
              className={inputClass}
            />
            <p className="mt-1 text-center text-xs text-muted">毫秒</p>
          </div>
        </div>
        {filledIn && !secondsValid && (
          <p className="mt-1 text-xs text-danger">秒数需在 0-59 之间</p>
        )}
        {filledIn && secondsValid && parsedMs === null && (
          <p className="mt-1 text-xs text-danger">
            总时长需在 0:40.000 ~ 5:00.000 之间
          </p>
        )}
      </div>

      {previewDifficulty !== null && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3">
          <span className="text-sm text-muted">建议 AI 难度</span>
          <span className={`text-2xl font-bold ${difficultyColorClass(previewDifficulty)}`}>
            {previewDifficulty}
          </span>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-emerald-400">保存成功</p>}

      <button
        type="submit"
        disabled={loading || parsedMs === null}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "保存中..." : "保存圈速"}
      </button>
    </form>
  );
}
