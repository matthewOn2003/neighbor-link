import { Icon } from "@/components/ui/Icon";

export function SearchBar({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`relative flex-1 min-w-[220px] max-w-sm ${className}`}>
      <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
      <input
        className="input input-search pl-10"
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
