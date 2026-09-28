import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import ConfirmModal from "../ConfirmModal";

describe("ConfirmModal", () => {
  test("renders an accessible alert dialog with its title and message", () => {
    render(<ConfirmModal title="Delete this?" message="This cannot be undone." onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByRole("alertdialog", { name: "Delete this?", description: "This cannot be undone." })
    ).toBeInTheDocument();
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

  test("moves focus into the dialog and traps keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<ConfirmModal title="Delete this?" message="x" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const confirmButton = screen.getByRole("button", { name: "Delete" });

    expect(cancelButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();
  });

  test("closes on Escape when it is not submitting", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmModal title="Delete this?" message="x" onConfirm={vi.fn()} onCancel={onCancel} />);

    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("does not close on Escape while submitting", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmModal title="Delete this?" message="x" isSubmitting onConfirm={vi.fn()} onCancel={onCancel} />);

    await user.keyboard("{Escape}");
    expect(onCancel).not.toHaveBeenCalled();
  });

  test("restores focus to the control that opened the dialog", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open dialog
          </button>
          {isOpen && (
            <ConfirmModal
              title="Delete this?"
              message="x"
              onConfirm={vi.fn()}
              onCancel={() => setIsOpen(false)}
            />
          )}
        </>
      );
    }

    render(<Harness />);
    const openButton = screen.getByRole("button", { name: "Open dialog" });
    await user.click(openButton);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(openButton).toHaveFocus();
  });
});
