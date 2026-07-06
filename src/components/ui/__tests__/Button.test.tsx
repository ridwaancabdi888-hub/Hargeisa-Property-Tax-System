import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Button from "../Button";

describe("Button", () => {
  test("renders children and calls onClick", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies the danger variant's red background class", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("bg-red-600");
  });

  test("respects the disabled prop", async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
