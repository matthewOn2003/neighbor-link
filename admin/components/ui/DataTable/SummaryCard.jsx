import { Icon } from "../Icon";

export function SummaryCard({ label, value, trend, icon }) {
  return (
    <div className="bg-accent p-4 rounded-xl border shadow flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-subtle">{label}</span>
        <p className="text-2xl font-semibold text-scene-content">{value}</p>
        {trend && (
          <span className="text-xs text-success inline-flex items-center gap-0.5 font-medium">
            <Icon name="trending_up" className="text-sm" />
            {trend}
          </span>
        )}
      </div>
      <div className="w-11 h-11 rounded-xl bg-scene flex items-center justify-center text-primary">
        <Icon name={icon} className="text-2xl" />
      </div>
    </div>
  );
}
