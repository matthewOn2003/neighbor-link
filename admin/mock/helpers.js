export function paginate(items, { page = 1, page_size = 10 }) {
  const start = (page - 1) * page_size;
  return {
    list: items.slice(start, start + page_size),
    pagination: { page, page_size, total: items.length },
  };
}