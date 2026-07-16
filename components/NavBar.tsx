import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname ?? null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="h-[3px] bg-brand" />
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="inline-block h-4 w-1.5 rounded-sm bg-brand" />
          PitLane
          <span className="hidden text-xs font-normal text-muted sm:inline">
            F1 25 车手社区
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/rooms" className="transition-colors hover:text-foreground">
            房间列表
          </Link>
          {user ? (
            <>
              <Link href="/laptimes/new" className="transition-colors hover:text-foreground">
                录入圈速
              </Link>
              <Link
                href="/profile"
                className="font-medium text-foreground transition-colors hover:text-brand"
              >
                {nickname ?? "我的资料"}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="transition-colors hover:text-foreground">
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand px-3 py-1.5 font-medium text-white transition-colors hover:bg-brand-hover active:scale-[0.98]"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
