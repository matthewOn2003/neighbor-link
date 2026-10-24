// 状态徽标。标签和颜色都来自后端字典项 { value, label, variant }（useDropdown 的 optionsOf 结果）。
// 找不到对应项时直接显示原始值，颜色用中性色。
export function StatusBadge({ value, options = [], className = "" }) {
  const item = options.find((option) => option.value === value);
  return (
    <span className={`status-pill ${item?.variant || "neutral"} ${className}`.trim()}>
      {item?.label ?? value ?? "-"}
    </span>
  );
}
