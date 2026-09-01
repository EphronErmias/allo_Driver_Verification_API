export function Table({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<string>>;
}) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-code">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 font-medium text-muted">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 align-top ${j === 0 ? "font-mono text-[13px] text-accent" : "text-foreground"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
