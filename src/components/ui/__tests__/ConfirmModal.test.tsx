import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import ConfirmModal from "../ConfirmModal";

describe("ConfirmModal", () => {
  test("renders title and message", () => {
    render(<ConfirmModal title="Delete this?" message="This cannot be undone." onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Delete this?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  test("calls onConfirm and onCancel", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmModal title="Delete this?" message="x" onConfirm={onConfirm} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("disables both buttons and shows a busy label while submitting", () => {
    render(<ConfirmModal title="x" message="x" isSubmitting onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
  });

  test("supports a custom confirm label", () => {
    render(<ConfirmModal title="x" message="x" confirmLabel="Restore Database" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Restore Database" })).toBeInTheDocument();
  });
});
