type Props = {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  query?: Record<string, string | number | undefined>;
};

function buildHref(basePath: string, page: number, pageSize: number, query?: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("pageSize", String(pageSize));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") sp.set(k, String(v));
    }
  }
  return `${basePath}?${sp.toString()}`;
}

export default function PaginationLinks({ basePath, page, pageSize, total, query }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
      <span>
        Page {safePage} / {totalPages} ({total} data)
      </span>
      <a href={buildHref(basePath, 1, pageSize, query)}>First</a>
      <a href={buildHref(basePath, Math.max(1, safePage - 1), pageSize, query)}>Prev</a>
      <a href={buildHref(basePath, Math.min(totalPages, safePage + 1), pageSize, query)}>Next</a>
      <a href={buildHref(basePath, totalPages, pageSize, query)}>Last</a>
    </div>
  );
}
