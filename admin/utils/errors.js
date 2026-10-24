// 统一把 request() 抛出的错误（ApiError：code / message）转成提示文字。
//
// codes：后端错误码 -> i18n key。命中则显示对应文案。
//        DUPLICATE、IN_USE 是通用错误码，默认已映射，调用方不用再写。
// serverMessage：没有命中 codes 时，是否显示后端返回的 message（默认显示）。
//                设为 false 时只显示 fallbackKey 对应的文案。
// fallbackKey：兜底文案的 i18n key（必填）。
const COMMON_CODES = {
  DUPLICATE: "duplicate_record",
  IN_USE: "record_in_use",
};

export function apiErrorMessage(err, t, { fallbackKey, codes = {}, serverMessage = true }) {
  const map = { ...COMMON_CODES, ...codes };
  const key = err?.code ? map[err.code] : undefined;
  if (key) return t(key);
  if (serverMessage && err?.message) return err.message;
  return t(fallbackKey);
}
