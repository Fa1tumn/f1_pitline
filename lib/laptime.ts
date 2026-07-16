// 圈速格式 M:SS.mmm <-> 毫秒 的互转，以及 AI 难度建议计算
//
// 难度曲线按基准圈速的比例缩放，而非固定"每 0.1 秒 = 1 点"：
// 难度 0→110 的圈速跨度 ≈ 基准（难度 110）圈速的 16.27%，24 条赛道实测该比例稳定在 15.76%~16.92%，
// 数据来源 https://github.com/rlfh/f1-2022-difficulty-helper（F1 2022 社区众测，方法论与本项目一致）

export const MIN_TIME_MS = 40_000;
export const MAX_TIME_MS = 300_000;

/** 毫秒格式化为 "1:27.456" */
export function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const millis = ms % 1_000;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(
    millis
  ).padStart(3, "0")}`;
}

// 难度 0→110 的圈速跨度占基准圈速的比例（见文件顶部说明）
const DIFFICULTY_FULL_RANGE_RATIO = 0.1627;

/** 每一点难度对应的毫秒数，随赛道基准圈速等比例缩放（长赛道每点耗时更多） */
export function msPerDifficultyPoint(baselineTimeMs: number): number {
  return (baselineTimeMs * DIFFICULTY_FULL_RANGE_RATIO) / 110;
}

/** 根据赛道基准计算建议难度（比例公式近似），clamp 到 [0, 110] */
export function calcDifficulty(
  baselineDifficulty: number,
  baselineTimeMs: number,
  userTimeMs: number
): number {
  const msPerPoint = msPerDifficultyPoint(baselineTimeMs);
  const raw = baselineDifficulty - (userTimeMs - baselineTimeMs) / msPerPoint;
  return Math.max(0, Math.min(110, Math.round(raw)));
}

/**
 * 用赛道完整难度曲线（111 个点，下标 0=难度0 ... 下标 110=难度110）线性插值计算建议难度，
 * 精度远高于比例公式（数据来源：F1Laps.com 各赛道计算器页面内嵌曲线，见 supabase/schema.sql）
 */
export function calcDifficultyFromCurve(
  curveMs: number[],
  userTimeMs: number
): number {
  if (userTimeMs <= curveMs[110]) return 110;
  if (userTimeMs >= curveMs[0]) return 0;

  for (let i = 0; i < 110; i++) {
    if (curveMs[i] >= userTimeMs && userTimeMs >= curveMs[i + 1]) {
      const frac = (curveMs[i] - userTimeMs) / (curveMs[i] - curveMs[i + 1]);
      return Math.round(i + frac);
    }
  }
  return 55; // 理论上不会走到这里
}

/** 综合建议难度：所有已录入赛道建议难度的平均值，四舍五入 */
export function calcOverallDifficulty(difficulties: number[]): number | null {
  if (difficulties.length === 0) return null;
  const avg = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
  return Math.round(avg);
}

/** 用于大号数字展示（如综合难度）的文字颜色 */
export function difficultyColorClass(difficulty: number | null): string {
  if (difficulty === null) return "text-muted";
  if (difficulty >= 90) return "text-red-400";
  if (difficulty >= 60) return "text-orange-400";
  if (difficulty >= 30) return "text-yellow-400";
  return "text-emerald-400";
}

/** 用于列表/表格里的难度徽章（底色+文字色一起） */
export function difficultyBadgeClass(difficulty: number | null): string {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold";
  if (difficulty === null) return `${base} bg-surface-2 text-muted`;
  if (difficulty >= 90) return `${base} bg-red-500/15 text-red-400`;
  if (difficulty >= 60) return `${base} bg-orange-500/15 text-orange-400`;
  if (difficulty >= 30) return `${base} bg-yellow-500/15 text-yellow-400`;
  return `${base} bg-emerald-500/15 text-emerald-400`;
}
