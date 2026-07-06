import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import PropertyFormModal from "../PropertyFormModal";
import { ApiError } from "../../../lib/api";
import type { PropertyDetail, PropertyListing } from "../../../types/property";

vi.mock("../../../lib/propertyImagesApi", () => ({
  uploadPropertyImages: vi.fn(),
  deletePropertyImage: vi.fn(),
}));

const sampleProperty: PropertyListing = {
  id: 1,
  title: "Sunset Villa",
  description: "A lovely villa",
  price: 250000,
  location: "Jigjiga Yar",
  type: "sale",
  status: "available",
  createdBy: 1,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("PropertyFormModal", () => {
  test("shows validation errors and does not call onSubmit when fields are invalid", async () => {
    const onSubmit = vi.fn();
    render(<PropertyFormModal onSubmit={onSubmit} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Create Property" }));

    expect(await screen.findByText("Title must be at least 3 characters")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Location is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("submits valid values and closes the modal", async () => {
    const onSubmit = vi.fn().mockResolvedValue(sampleProperty);
    const onClose = vi.fn();
    render(<PropertyFormModal onSubmit={onSubmit} onClose={onClose} />);

    await userEvent.type(screen.getByLabelText("Title"), "New Villa");
    await userEvent.type(screen.getByLabelText("Description"), "Nice place");
    await userEvent.type(screen.getByLabelText("Price ($)"), "1000");
    await userEvent.type(screen.getByLabelText("Location"), "Hargeisa");
    await userEvent.click(screen.getByRole("button", { name: "Create Property" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Villa", description: "Nice place", price: "1000", location: "Hargeisa" })
    );
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test("shows the server error message when onSubmit rejects with an ApiError", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError("Email is already in use", 409));
    render(<PropertyFormModal onSubmit={onSubmit} onClose={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("Title"), "New Villa");
    await userEvent.type(screen.getByLabelText("Description"), "Nice place");
    await userEvent.type(screen.getByLabelText("Price ($)"), "1000");
    await userEvent.type(screen.getByLabelText("Location"), "Hargeisa");
    await userEvent.click(screen.getByRole("button", { name: "Create Property" }));

    expect(await screen.findByText("Email is already in use")).toBeInTheDocument();
  });

  test("pre-fills the form when editing an existing property", () => {
    const property: PropertyDetail = { ...sampleProperty, images: [] };
    render(<PropertyFormModal property={property} onSubmit={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByDisplayValue("Sunset Villa")).toBeInTheDocument();
    expect(screen.getByDisplayValue("250000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });
});
