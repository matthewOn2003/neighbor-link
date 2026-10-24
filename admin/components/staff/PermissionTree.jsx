"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui";
import { useLocale } from "@/i18n";

const MODULES = [
  ["dashboard", "menu_dashboard", ["list"]],
  ["properties", "menu_properties", ["list", "add", "update", "delete"]],
  ["tenant", "menu_tenants", ["list", "add", "update", "delete"]],
  ["contracts", "menu_contracts", ["list", "add", "update", "delete"]],
  ["bills", "menu_bills", ["list", "add", "update", "delete"]],
  ["users", "menu_users", ["list", "add", "update", "delete"]],
];

const TREE = {
  id: "root",
  label: "permission_all",
  children: MODULES.map(([id, label, actions]) => ({
    id,
    label,
    children: actions.map((action) => ({
      id: `perm-${id}-${action}`,
      label: `perm-${id}-${action}`,
    })),
  })),
};

const DEFAULT_EXPANDED = ["root", ...MODULES.map(([id]) => id)];

// 同时兼容已解析的数组和后端返回的 JSON 字符串
export function parsePermissionIds(value) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

// 节点及其所有子节点的 id，勾选模块时会一并勾选其下的权限
const collectIds = (node) => [node.id, ...(node.children || []).flatMap(collectIds)];

export function PermissionTree({ value, onChange }) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(DEFAULT_EXPANDED);

  const isChecked = (node) => collectIds(node).every((id) => value.includes(id));

  function toggle(node, on) {
    const ids = collectIds(node);
    onChange(
      on
        ? [...new Set([...value, ...ids])]
        : value.filter((id) => !ids.includes(id)),
    );
  }

  return (
    <div className="rounded-xl border border-scene p-4">
      <h3 className="font-semibold text-scene-content">{t("permission_tree")}</h3>
      <p className="mb-3 text-xs text-subtle">{t("permission_tree_hint")}</p>
      <TreeNode
        node={TREE}
        depth={0}
        expanded={expanded}
        setExpanded={setExpanded}
        isChecked={isChecked}
        toggle={toggle}
      />
    </div>
  );
}

function TreeNode({ node, depth, expanded, setExpanded, isChecked, toggle }) {
  const { t } = useLocale();
  const hasChildren = !!node.children?.length;
  const open = expanded.includes(node.id);

  function toggleOpen() {
    setExpanded((current) =>
      current.includes(node.id)
        ? current.filter((id) => id !== node.id)
        : [...current, node.id],
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-md py-2 hover:bg-accent"
        style={{ paddingLeft: depth * 22 }}
      >
        {hasChildren ? (
          <button type="button" className="w-5 text-subtle" onClick={toggleOpen} aria-label={t(node.label)}>
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Checkbox
          checked={isChecked(node)}
          onChange={(e) => toggle(node, e.target.checked)}
          aria-label={t(node.label)}
        />
        <span className={depth === 0 ? "font-semibold" : ""}>{t(node.label)}</span>
        {depth === 2 ? <code className="ml-auto text-xs text-subtle">{node.id}</code> : null}
      </div>
      {hasChildren && open
        ? node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            setExpanded={setExpanded}
            isChecked={isChecked}
            toggle={toggle}
          />
        ))
        : null}
    </div>
  );
}
