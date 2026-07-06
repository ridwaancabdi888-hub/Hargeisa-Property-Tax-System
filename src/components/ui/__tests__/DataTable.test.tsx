import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import DataTable, { type Column } from "../DataTable";

interface Row {
  id: number;
  name: string;
  amount: number;
}

const columns: Column<Row>[] = [
  { header: "Name", render: (r) => r.name },
  { header: "Amount", align: "right", render: (r) => `$${r.amount}` },
];

const rows: Row[] = [
  { id: 1, name: "Alice", amount: 100 },
  { id: 2, name: "Bob", amount: 200 },
];

describe("DataTable", () => {
  test("renders a header cell per column and a row per data item", () => {
    render(<DataTable columns={columns} rows={rows} rowKey={(r) => String(r.id)} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();
  });

  test("renders no data rows for an empty list", () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(r) => String(r.id)} />);
    expect(screen.queryAllByRole("row")).toHaveLength(1); // header row only
  });
});
