import { Icon } from "@/components/ui";

const COVER_GRADIENTS = [
  "bg-gradient-to-br from-[#6063ee] to-[#a5b4fc]",
  "bg-gradient-to-br from-[#0f766e] to-[#5eead4]",
  "bg-gradient-to-br from-[#b45309] to-[#fcd34d]",
  "bg-gradient-to-br from-[#be185d] to-[#f9a8d4]",
  "bg-gradient-to-br from-[#334155] to-[#94a3b8]",
];

export function PropertyCover({ id, coverImage, className = "" }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {coverImage ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }} />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center ${COVER_GRADIENTS[id % COVER_GRADIENTS.length]}`}>
          <Icon name="apartment" className="text-white/70 text-5xl" />
        </div>
      )}
    </div>
  );
}

export function OccupancyBar({ label, occupied, total }) {
  const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-subtle">
        <span>{label}</span>
        <span className="font-semibold text-scene-content">{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-scene overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function StatBlock({ value, label }) {
  return (
    <div className="flex flex-col rounded-lg bg-scene px-2 py-2">
      <span className="text-base font-semibold text-scene-content">{value}</span>
      <span className="text-[11px] text-subtle">{label}</span>
    </div>
  );
}

