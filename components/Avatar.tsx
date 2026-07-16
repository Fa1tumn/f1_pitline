export default function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-base";
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-semibold text-foreground`}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </div>
  );
}
