const { createAgent, loginAs } = require("../helpers");

describe("Property exports", () => {
  let adminAgent;
  let csrfToken;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken } = await loginAs(adminAgent, "admin", "Admin@12345"));
  });

  test("CSV export returns a CSV file with a header row", async () => {
    const res = await adminAgent.get("/api/property-listings/export/csv");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text.split("\n")[0]).toBe("ID,Title,Description,Price,Location,Type,Status,Created At");
  });

  test("Excel export returns a valid XLSX file", async () => {
    const res = await adminAgent.get("/api/property-listings/export/excel").buffer(true).parse((res, cb) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => cb(null, Buffer.concat(chunks)));
    });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("spreadsheetml");
    // ZIP/XLSX magic bytes
    expect(res.body.slice(0, 2).toString()).toBe("PK");
  });

  test("export respects the same filters as the list endpoint", async () => {
    const created = await adminAgent
      .post("/api/property-listings")
      .set("X-CSRF-Token", csrfToken)
      .send({ title: "Export Filter Test", description: "x", price: 100, location: "Hargeisa", type: "rent" });

    const res = await adminAgent.get("/api/property-listings/export/csv?type=sale");
    expect(res.text).not.toContain("Export Filter Test");

    await adminAgent.delete(`/api/property-listings/${created.body.data.id}`).set("X-CSRF-Token", csrfToken);
  });
});
