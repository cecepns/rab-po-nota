export default function Logo({
  size = "md",
  showText = true,
  className = "",
  light = false,
  iconOnly = false,
}) {
  const heightMap = {
    sm: "h-9",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  };

  const textMap = {
    sm: { title: "text-base", sub: "text-[10px]" },
    md: { title: "text-lg", sub: "text-xs" },
    lg: { title: "text-2xl", sub: "text-sm" },
    xl: { title: "text-3xl", sub: "text-base" },
  };

  const h = heightMap[size] || heightMap.md;
  const t = textMap[size] || textMap.md;

  // Icon only
  if (iconOnly) {
    return (
      <img
        src="/logo-icon.png"
        alt="Logo RAB PO Nota"
        className={`${h} w-auto object-contain select-none ${className}`}
      />
    );
  }

  // Tampilan di latar gelap (misal: Sidebar gelap atau Hero banner login)
  if (light) {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <img
          src="/logo-icon.png"
          alt="Logo RAB PO Nota"
          className={`${h} w-auto object-contain drop-shadow-md`}
        />
        {showText && (
          <div className="flex flex-col leading-tight">
            <span className={`font-black tracking-tight text-white ${t.title}`}>
              RAB<span className="text-teal-400">·</span>PO<span className="text-teal-400">·</span>NOTA
            </span>
          </div>
        )}
      </div>
    );
  }

  // Tampilan default di latar terang (menggunakan gambar PNG logo lengkap transparan, tanpa kotak/background)
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="RAB PO Nota Logo"
        className={`${h} w-auto object-contain`}
      />
    </div>
  );
}
