const sanitizeInput = require("../../src/middleware/sanitize");

function runMiddleware(body) {
  const req = { body };
  const next = jest.fn();
  sanitizeInput(req, {}, next);
  expect(next).toHaveBeenCalledTimes(1);
  return req.body;
}

describe("sanitizeInput middleware", () => {
  test("trims leading/trailing whitespace from string fields", () => {
    const result = runMiddleware({ title: "  Sunset Villa  " });
    expect(result.title).toBe("Sunset Villa");
  });

  test("strips control characters but keeps newlines/tabs", () => {
    const result = runMiddleware({ description: "Line one\nLine two\tTabbed\x07bell" });
    expect(result.description).toBe("Line one\nLine two\tTabbedbell");
  });

  test("recurses into nested objects and arrays", () => {
    const result = runMiddleware({ nested: { a: "  x  ", list: ["  y  ", "  z  "] } });
    expect(result.nested.a).toBe("x");
    expect(result.nested.list).toEqual(["y", "z"]);
  });

  test("leaves non-string values untouched", () => {
    const result = runMiddleware({ price: 100, active: true, tags: null });
    expect(result.price).toBe(100);
    expect(result.active).toBe(true);
    expect(result.tags).toBeNull();
  });
});
