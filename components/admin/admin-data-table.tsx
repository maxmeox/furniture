export function AdminDataTable({ title, columns, rows }: { title: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
      <div className="border-b border-border p-5 text-lg font-bold">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr role="row">
              {columns.map((col, i) => (
                <th key={i} scope="col" className="px-5 py-3 text-left text-sm font-semibold text-muted-foreground border-b border-border">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} role="row" className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-5 py-3 text-sm text-foreground border-none">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
