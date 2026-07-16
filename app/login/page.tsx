"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass = "w-full rounded-md border px-3 py-2 text-sm";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "邮箱或密码错误"
          : signInError.message
      );
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-border bg-surface p-6">
      <h1 className="mb-6 text-lg font-semibold">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className={inputClass}
            placeholder="密码"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        还没有账号？{" "}
        <Link href="/register" className="text-brand hover:underline">
          去注册
        </Link>
      </p>
    </div>
  );
}
