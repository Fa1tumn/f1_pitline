import { createBrowserClient } from "@supabase/ssr";

// 未使用生成的 Database 类型（避免新版 postgrest-js 编译期 select 解析过严导致误报），
// 查询结果通过 lib/types.ts 中手写的接口 + .returns<T>() 手动标注类型。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
