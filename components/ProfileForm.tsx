"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Platform, Profile } from "@/lib/types";

const PLATFORMS: Platform[] = ["PC", "PS", "Xbox"];
const inputClass = "w-full rounded-md border px-3 py-2 text-sm";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(profile.nickname);
  const [platform, setPlatform] = useState<Platform>(profile.platform);
  const [qq, setQq] = useState(profile.qq ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (nickname.trim().length < 1 || nickname.trim().length > 20) {
      setError("昵称长度需为 1-20 个字符");
      return;
    }
    if (qq.trim() !== "" && !/^[0-9]{5,12}$/.test(qq.trim())) {
      setError("QQ 号需为 5-12 位数字");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        nickname: nickname.trim(),
        platform,
        qq: qq.trim() === "" ? null : qq.trim(),
      })
      .eq("id", profile.id);
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted">昵称</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          required
          className={inputClass}
        />
      </div>
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
          QQ 号（仅本人可见，双人生涯组队成功后互相展示）
        </label>
        <input
          type="text"
          value={qq}
          onChange={(e) => setQq(e.target.value)}
          className={inputClass}
          placeholder="5-12 位数字，可留空"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-400">已保存</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "保存中..." : "保存资料"}
      </button>
    </form>
  );
}
