import logoImg from "@/assets/logo.png";

export default function Logo({
  size = "md",
  showText = true,
  className = "",
  light = false,
  iconOnly = false,
}) {
  const heightMap = {
    xs: "h-7",
    sm: "h-9",
    md: "h-11",
    lg: "h-14",
    xl: "h-20",
  };

  const h = heightMap[size] || heightMap.md;

  // Icon only (emblem)
  if (iconOnly) {
    return (
      <img
        src="/logo-icon.png"
        alt="Logo Ikatandi Group"
        className={`${h} w-auto object-contain select-none ${className}`}
      />
    );
  }

  // Tampilan di latar gelap (misal: Sidebar gelap)
  if (light) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <div className="bg-white/95 rounded-xl px-2.5 py-1 shadow-xs border border-white/20">
          <img
            src={logoImg}
            alt="Logo Ikatandi Group"
            className={`${h} w-auto object-contain`}
          />
        </div>
      </div>
    );
  }

  // Tampilan default di latar terang
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="Logo Ikatandi Group"
        className={`${h} w-auto object-contain`}
      />
    </div>
  );
}
