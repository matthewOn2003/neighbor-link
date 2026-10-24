// 把列表转成「key -> value」的查找表。
// keyOf 默认取 item.value；valueOf 默认取整个 item。
export function indexBy(list = [], keyOf = (item) => item.value, valueOf = (item) => item) {
  return Object.fromEntries(list.map((item) => [keyOf(item), valueOf(item)]));
}

// 下拉选项 -> { value: label }，用于把存的值显示成文字。
export function labelMap(options = []) {
  return indexBy(options, (option) => option.value, (option) => option.label);
}
