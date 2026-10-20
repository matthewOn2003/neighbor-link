"use client";

import { useState } from "react";
import { Icon } from "../Icon";

export function FilterSection({ values, badges, onClear, filterHint, resetFilters, applyFilters, children }) {
  const [open, setOpen] = useState(true);

  // 有值的筛选项显示为 badge，基于当前输入，不必等 Apply
  const activeBadges = (badges ?? []).filter(({ key }) => values?.[key] !== "" && values?.[key] != null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <Icon name="filter_alt" className="text-lg" />
            <span>Filters</span>
            <Icon
              name="expand_more"
              className={`text-lg transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
            />
          </button>
          <div className="scrollbar-hidden flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
            {activeBadges.map(({ key, label, display }) => (
              <span
                key={key}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line/60 bg-primary/5 py-1 pl-3 pr-2 text-xs"
              >
                <span className="font-medium text-subtle">{label}</span>
                <span className="font-semibold text-primary">{display ? display(values[key]) : values[key]}</span>
                <button
                  type="button"
                  aria-label={`Clear ${label}`}
                  className="inline-flex items-center justify-center rounded-full text-subtle transition-colors hover:text-scene-content"
                  onClick={() => onClear?.(key)}
                >
                  <Icon name="close" className="text-sm" />
                </button>
              </span>
            ))}
          </div>
          {filterHint ? <span className="shrink-0 text-xs text-subtle">• {filterHint}</span> : null}
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="rounded-lg border border-line/40 bg-scene">
            <div className="grid grid-cols-1 gap-gutter p-gutter sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">{children}</div>
            {resetFilters || applyFilters ? (
              <div className="flex items-center justify-end gap-3 border-t border-line/40 px-gutter py-4">
                {resetFilters ? (
                  <button className="btn btn-outline" type="button" onClick={resetFilters}>
                    Clear All
                  </button>
                ) : null}
                {applyFilters ? (
                  <button className="btn btn-primary" type="button" onClick={applyFilters}>
                    Apply Filters
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
