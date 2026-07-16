"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass = "w-full rounded-md border px-3 py-2 text-sm";

export default function RegisterPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (nickname.trim().length < 1 || nickname.trim().length > 20) {
      setError("昵称长度需为 1-20 个字符");
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要 6 位");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname: nickname.trim() },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/profile");
      router.refresh();
    } else {
      setNeedsConfirm(true);
    }
  }

  if (needsConfirm) {
    return (
      <div className="mx-auto max-w-sm rounded-lg border border-border bg-surface p-6 text-center">
        <h1 className="mb-2 text-lg font-semibold">注册成功</h1>
        <p className="text-sm text-muted">
          请前往邮箱 {email} 查收确认邮件，确认后即可登录。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-border bg-surface p-6">
      <h1 className="mb-6 text-lg font-semibold">注册</h1>
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
            placeholder="车手昵称"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputClass}
            placeholder="至少 6 位"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        已有账号？{" "}
        <Link href="/login" className="text-brand hover:underline">
          去登录
        </Link>
      </p>
    </div>
  );
}
