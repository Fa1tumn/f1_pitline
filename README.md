# PitLane

面向 EA Sports **F1 25** 玩家的社区网站：TT 圈速录入 + AI 难度建议、双人生涯队友招募、大奖赛组局。

## 功能

1. **TT 圈速录入 + AI 难度建议** —— 玩家手动录入 Time Trial 圈速（等性能模式），系统据此计算建议 AI 难度（0-110）。
2. **双人生涯招募** —— 房主发招募帖（含 QQ 号、要求），玩家申请，房主审批，通过后互见 QQ 号。
3. **大奖赛房间** —— 房主创建比赛房间（时间、赛道、难度门槛、Oopz/KOOK 房间码），玩家报名，系统校验 TT 是否达标。

无审核机制、无站内私信 —— 圈速纯信任制，联系方式在双方确认关系后直接展示，不做额外的消息系统。

## 技术栈

- [Next.js](https://nextjs.org/)（App Router）+ TypeScript
- [Supabase](https://supabase.com/)（PostgreSQL + Auth，邮箱登录）
- Tailwind CSS
- 部署：Vercel

## 快速开始

```bash
npm install
cp .env.example .env.local   # 填入你的 Supabase Project URL / anon key
```

在 Supabase Dashboard 的 SQL Editor 里执行一次 `supabase/schema.sql`（建表 + RLS 策略 + 赛道种子数据），然后：

```bash
npm run dev
```


## AI 难度算法与数据来源

这是本项目最核心、也是打磨最久的部分，这里完整记录数据是怎么来的，方便以后校准或有人想复用。

### 算法

每条赛道在 `tracks` 表里存一条**难度曲线** `difficulty_curve_ms`：111 个点，依次对应 AI 难度 0 → 110 的圈速（毫秒）。玩家录入圈速后，在这条曲线上做线性插值算出建议难度（`supabase/schema.sql` 里的 `calc_difficulty()` 函数，前端 `lib/laptime.ts` 的 `calcDifficultyFromCurve()` 做实时预览）。

如果某条赛道还没有曲线数据，会退回一个更简单的比例公式兜底：

```
每点难度对应的毫秒数 = 基准圈速(难度110的圈速) × 0.1627 / 110
建议难度 = 110 - (玩家圈速 - 基准圈速) / 每点难度对应的毫秒数
```

即难度 0→110 的圈速跨度 ≈ 基准圈速的 16.27%，按比例缩放，而不是常见的"每 0.1 秒 = 1 点"（这个假设经核实并不准确，见下）。

### 数据来源与校准过程

难度曲线这件事前后换过几版数据源，按时间顺序：

1. **最初假设**："每 0.1 秒圈速 ≈ 1 点难度"的固定线性公式 —— 后来证明不准确，各赛道差异很大（短赛道如红牛环，1 点只值约 0.065-0.095 秒；长赛道如斯帕，1 点要值 0.15 秒以上）。
2. **F1 2022 社区实测数据**（[rlfh/f1-2022-difficulty-helper](https://github.com/rlfh/f1-2022-difficulty-helper)，原始数据来自 Reddit 用户 u/phail216 的众测）：24 条赛道、每条 111 个难度点的实测圈速。用这份数据验证出「难度跨度≈基准圈速 16.27%」这个比例关系，在 24 条赛道上稳定在 15.76%~16.92% 之间。但这是 F1 2022 而非 F1 25 的数据。
3. **F1Laps.com 的 F1 25 社区统计**（[average-difficulty](https://www.f1laps.com/f1-25/average-difficulty/) / [average-lap-times](https://www.f1laps.com/f1-25/average-lap-times/)）：每条赛道的平均 AI 难度 + 平均圈速，反推出 24 条赛道的 `baseline_time_ms` 占位值。是真实 F1 25 数据，但"平均圈速"统计混入了非等性能模式的成绩，精度有限。
4. **玩家实测数据校准**：项目使用者亲自在游戏里对阿尔伯特公园赛道（澳大利亚）测试了难度 0/20/40/60/80/100/110 对应的圈速，发现跟第 3 步的占位值有明显偏差。
5. **F1Laps.com AI 难度计算器内嵌曲线**（[ai-difficulty-calculator](https://www.f1laps.com/f1-25/ai-difficulty-calculator/)）：这个计算器工具页面本身，每条赛道的页面里都内嵌了一份完整的 111 点曲线（Chart.js 数据），经与第 4 步的玩家实测数据逐点核对，**完全一致（精确到毫秒）**。于是把这 24 条赛道的完整曲线都抓取下来，作为当前 `difficulty_curve_ms` 的数据源，替代之前的比例公式近似。

抓取方式：24 条赛道各请求一次对应的计算器页面（`https://www.f1laps.com/f1-25/ai-difficulty-calculator/<track>/`），解析页面里内嵌的 Chart.js 数据段，不涉及批量爆破式请求。

### 现状与已知局限

- 全部 24 条赛道都已经是 F1Laps 的实测曲线数据，理论精度是"整数难度点位精确匹配，点位之间线性插值"，已用真实玩家数据在阿尔伯特公园赛道验证过（多个难度点位误差为 0）。
- 这份数据终归来自第三方工具，不是游戏本体的官方数据；如果你有更多赛道的真实测试结果，欢迎用来替换/校准对应赛道的 `difficulty_curve_ms`（方法见 `docs/ARCHITECTURE.md`「基准校准」一节）。
- `baseline_time_ms` 字段保留作为曲线数据缺失时的兜底基准值。

## 项目结构

```
app/                  Next.js App Router 页面
components/           React 组件
lib/                  Supabase 客户端、圈速/难度计算逻辑、类型定义
supabase/schema.sql   建表 SQL + RLS 策略 + 赛道种子数据（含完整难度曲线）
docs/ARCHITECTURE.md  架构文档（页面、数据流、权限规则）
docs/DEPLOY.md        部署步骤
CLAUDE.md             项目约定与设计决策（给 AI 编程助手看的开发指南）
```

## 开发约定

详见 [CLAUDE.md](CLAUDE.md)：技术栈、关键设计决策、数据库约定、MVP 范围等。
