interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  emptyMessage = "No data",
  loading,
  className = "",
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item[keyField]} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-[var(--color-text)] ${col.className || ""}`}>
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
