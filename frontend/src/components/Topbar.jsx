export default function Topbar({ title, subtitle, action }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="flex items-start justify-between mb-7 animate-slide-down">
      <div>
        <p className="text-[10.5px] font-mono text-ink/35 uppercase tracking-widest mb-1">{today}</p>
        <h1 className="font-display text-2xl font-semibold text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink/45 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 mt-1">{action}</div>}
    </div>
  );
}
