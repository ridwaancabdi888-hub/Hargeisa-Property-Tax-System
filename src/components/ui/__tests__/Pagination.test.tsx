import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Pagination from "../Pagination";

describe("Pagination", () => {
  test("shows the correct range and page count", () => {
    render(<Pagination meta={{ total: 42, totalPages: 5, currentPage: 2, limit: 10 }} onPageChange={vi.fn()} />);
    expect(screen.getByText("Showing 11-20 of 42")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  test("Prev is disabled on the first page, Next is enabled", () => {
    render(<Pagination meta={{ total: 42, totalPages: 5, currentPage: 1, limit: 10 }} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  test("Next is disabled on the last page", () => {
    render(<Pagination meta={{ total: 42, totalPages: 5, currentPage: 5, limit: 10 }} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  test("clicking Next calls onPageChange with currentPage + 1", async () => {
    const onPageChange = vi.fn();
    render(<Pagination meta={{ total: 42, totalPages: 5, currentPage: 2, limit: 10 }} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("shows zero range when there are no results", () => {
    render(<Pagination meta={{ total: 0, totalPages: 1, currentPage: 1, limit: 10 }} onPageChange={vi.fn()} />);
    expect(screen.getByText("Showing 0-0 of 0")).toBeInTheDocument();
  });
});
