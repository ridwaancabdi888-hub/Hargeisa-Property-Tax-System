const { toCsv } = require("../../src/services/exportService");

describe("exportService.toCsv", () => {
  test("produces a header row plus one row per property", () => {
    const csv = toCsv([
      { id: 1, title: "Sunset Villa", description: "Nice", price: 100, location: "Hargeisa", type: "sale", status: "available", createdAt: "2026-01-01" },
    ]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("ID,Title,Description,Price,Location,Type,Status,Created At");
    expect(lines[1]).toBe("1,Sunset Villa,Nice,100,Hargeisa,sale,available,2026-01-01");
  });

  test("quotes and escapes fields containing commas, quotes, or newlines", () => {
    const csv = toCsv([
      { id: 2, title: 'Villa, "The Best"', description: "Line1\nLine2", price: 200, location: "X", type: "rent", status: "sold", createdAt: "2026-01-02" },
    ]);
    const dataLine = csv.split("\n").slice(1).join("\n");
    expect(dataLine).toContain('"Villa, ""The Best"""');
    expect(dataLine).toContain('"Line1\nLine2"');
  });

  test("returns just the header row for an empty list", () => {
    const csv = toCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
  });
});
