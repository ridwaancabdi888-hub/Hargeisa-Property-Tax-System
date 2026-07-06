import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  test("renders the status text", () => {
    render(<StatusBadge status="Paid" />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  test("resolves a known status to its default tone color", () => {
    render(<StatusBadge status="Overdue" />);
    expect(screen.getByText("Overdue")).toHaveClass("bg-red-50");
  });

  test("falls back to slate tone for an unknown status", () => {
    render(<StatusBadge status="Whatever" />);
    expect(screen.getByText("Whatever")).toHaveClass("bg-slate-100");
  });

  test("an explicit tone prop overrides the default mapping", () => {
    render(<StatusBadge status="Paid" tone="red" />);
    expect(screen.getByText("Paid")).toHaveClass("bg-red-50");
  });
});
