import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import NotificationsDropdown from "../NotificationsDropdown";
import { listNotifications, markNotificationRead } from "../../../lib/notificationsApi";

vi.mock("../../../lib/notificationsApi", () => ({
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
}));

const notification = {
  id: 1,
  type: "payment_overdue",
  message: "Payment for property HGA-001 is overdue",
  relatedPropertyId: 1,
  isRead: false,
  createdAt: "2026-11-07T08:00:00.000Z",
};

describe("NotificationsDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listNotifications).mockResolvedValue({
      data: [notification],
      meta: { unreadCount: 1 },
    });
    vi.mocked(markNotificationRead).mockResolvedValue({});
  });

  test("exposes the unread count and popup state to assistive technology", async () => {
    const user = userEvent.setup();
    render(<NotificationsDropdown />);

    const trigger = await screen.findByRole("button", { name: "Notifications, 1 unread" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(screen.getByRole("dialog", { name: "Notifications" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", {
        name: "Unread notification: Payment for property HGA-001 is overdue",
      }),
    ).toBeInTheDocument();
  });

  test("moves focus into the popup and restores it when Escape closes the popup", async () => {
    const user = userEvent.setup();
    render(<NotificationsDropdown />);

    const trigger = await screen.findByRole("button", { name: "Notifications, 1 unread" });
    await user.click(trigger);

    const notificationAction = screen.getByRole("button", {
      name: "Unread notification: Payment for property HGA-001 is overdue",
    });
    await waitFor(() => expect(notificationAction).toHaveFocus());

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Notifications" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
