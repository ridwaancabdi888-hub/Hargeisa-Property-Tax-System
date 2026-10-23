import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import ImageDropzone from "../ImageDropzone";

describe("ImageDropzone", () => {
  test("exposes a keyboard-accessible image chooser", async () => {
    const onFilesSelected = vi.fn();
    const user = userEvent.setup();
    render(<ImageDropzone images={[]} onFilesSelected={onFilesSelected} onRemove={vi.fn()} />);

    const chooser = screen.getByRole("button", { name: "Choose property images" });
    chooser.focus();
    await user.keyboard("{Enter}");

    expect(chooser).toHaveFocus();
    expect(screen.getByLabelText("Property image files")).toBeInTheDocument();
  });

  test("forwards valid images and announces invalid files", async () => {
    const onFilesSelected = vi.fn();
    const user = userEvent.setup({ applyAccept: false });
    render(<ImageDropzone images={[]} onFilesSelected={onFilesSelected} onRemove={vi.fn()} />);
    const input = screen.getByLabelText("Property image files");

    const validImage = new File(["image"], "property.png", { type: "image/png" });
    await user.upload(input, validImage);
    expect(onFilesSelected).toHaveBeenCalledWith([validImage]);

    const invalidFile = new File(["text"], "notes.txt", { type: "text/plain" });
    await user.upload(input, invalidFile);
    expect(screen.getByRole("alert")).toHaveTextContent('"notes.txt" is not a JPG, PNG, or WEBP image');
    expect(onFilesSelected).toHaveBeenCalledTimes(1);
  });

  test("gives every preview remove button a distinct accessible name", () => {
    render(
      <ImageDropzone
        images={[
          { key: "one", previewUrl: "/one.jpg" },
          { key: "two", previewUrl: "/two.jpg" },
        ]}
        onFilesSelected={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Remove image 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove image 2" })).toBeInTheDocument();
  });
});
