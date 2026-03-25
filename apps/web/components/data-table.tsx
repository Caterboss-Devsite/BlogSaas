import Link from "next/link";
import type { ReactNode } from "react";

type DataTableColumn<Row> = {
  key: string;
  label: string;
  render: (row: Row) => ReactNode;
};

type DataTableProps<Row extends { id: string }> = {
  columns: Array<DataTableColumn<Row>>;
  rows: Row[];
  emptyLabel: string;
};

export function DataTable<Row extends { id: string }>({ columns, rows, emptyLabel }: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <p style={{ margin: 0, color: "#6b7280" }}>{emptyLabel}</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: "left",
                  padding: ".75rem 0",
                  borderBottom: "1px solid #e5e7eb",
                  color: "#6b7280",
                  fontSize: ".88rem",
                  fontWeight: 600,
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: ".9rem 0",
                    borderBottom: "1px solid #f3f4f6",
                    verticalAlign: "top",
                  }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ExternalTextLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", textDecoration: "none" }}>
      {label}
    </Link>
  );
}
