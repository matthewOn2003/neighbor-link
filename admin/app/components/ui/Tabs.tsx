"use client";

import { useState } from "react";

export type TabItem = {
  key: string;
  label: string;
  content: React.ReactNode;
};

export function Tabs({ tabs, defaultTab }: { tabs: TabItem[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const activeTab = tabs.find((tab) => tab.key === active) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex gap-1" style={{ borderBottom: "var(--border-width) solid var(--line)" }}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className="px-4 py-2.5 text-sm font-semibold"
              style={{
                color: isActive ? "var(--accent)" : "var(--ink-muted)",
                borderBottom: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div style={{ paddingTop: "var(--section-gap)" }}>{activeTab?.content}</div>
    </div>
  );
}
