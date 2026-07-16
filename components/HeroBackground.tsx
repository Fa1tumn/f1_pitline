// 纯 CSS 生成的装饰性背景：方格旗纹理 + 红色光晕，不使用任何外部图片/商标素材
export default function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: [
          "radial-gradient(ellipse 60% 65% at 50% 10%, rgba(225,6,0,0.32), transparent 70%)",
          "conic-gradient(rgba(245,245,247,0.07) 90deg, transparent 90deg 180deg, rgba(245,245,247,0.07) 180deg 270deg, transparent 270deg)",
        ].join(", "),
        backgroundSize: "100% 100%, 44px 44px",
        maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
      }}
    />
  );
}
