export interface PageQuery {
  page?: string;
  limit?: string;
}

export function getPagination(query: PageQuery) {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const limit = Math.min(30, Math.max(1, Number(query.limit ?? 10) || 10));
  const start = (page - 1) * limit;
  return { page, limit, start };
}

export function paginate<T>(items: T[], query: PageQuery) {
  const { page, limit, start } = getPagination(query);
  const total = items.length;
  const pageItems = items.slice(start, start + limit);
  return {
    items: pageItems,
    page,
    limit,
    total,
    hasMore: start + pageItems.length < total
  };
}
