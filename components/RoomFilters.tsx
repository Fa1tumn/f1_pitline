"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Platform, RoomType } from "@/lib/types";

const TABS: { value: RoomType; label: string }[] = [
  { value: "career_duo", label: "双人生涯" },
  { value: "grand_prix", label: "大奖赛" },
];

const PLATFORMS: Platform[] = ["PC", "PS", "Xbox"];

export default function RoomFilters({ type }: { type: RoomType }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/rooms?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-6 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setParam("type", tab.value)}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              type === tab.value
                ? "border-brand text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <select
          defaultValue={searchParams.get("platform") ?? ""}
          onChange={(e) => setParam("platform", e.target.value)}
          className="rounded-md border border-border px-2 py-1.5"
        >
          <option value="">全部平台</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          max={110}
          placeholder="我的难度，只看能达标的房间"
          defaultValue={searchParams.get("maxDiff") ?? ""}
          onBlur={(e) => setParam("maxDiff", e.target.value)}
          className="w-56 rounded-md border border-border px-2 py-1.5"
        />
      </div>
    </div>
  );
}
