const { createAgent, loginAs } = require("../helpers");

describe("Property images", () => {
  let adminAgent;
  let csrfToken;
  let propertyId;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken } = await loginAs(adminAgent, "admin", "Admin@12345"));
    const res = await adminAgent
      .post("/api/property-listings")
      .set("X-CSRF-Token", csrfToken)
      .send({ title: "Image Test Property", description: "x", price: 100, location: "Hargeisa", type: "sale" });
    propertyId = res.body.data.id;
  });

  afterAll(async () => {
    await adminAgent.delete(`/api/property-listings/${propertyId}`).set("X-CSRF-Token", csrfToken);
  });

  test("uploads a valid PNG image", async () => {
    const res = await adminAgent
      .post(`/api/property-listings/${propertyId}/images`)
      .set("X-CSRF-Token", csrfToken)
      .attach("images", Buffer.from([0x89, 0x50, 0x4e, 0x47]), { filename: "test.png", contentType: "image/png" });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveLength(1);
  });

  test("rejects a non-image mimetype (400)", async () => {
    const res = await adminAgent
      .post(`/api/property-listings/${propertyId}/images`)
      .set("X-CSRF-Token", csrfToken)
      .attach("images", Buffer.from("not an image"), { filename: "test.txt", contentType: "text/plain" });
    expect(res.status).toBe(400);
  });

  test("rejects an oversized file (>5MB, 400)", async () => {
    const res = await adminAgent
      .post(`/api/property-listings/${propertyId}/images`)
      .set("X-CSRF-Token", csrfToken)
      .attach("images", Buffer.alloc(6 * 1024 * 1024), { filename: "big.png", contentType: "image/png" });
    expect(res.status).toBe(400);
  });

  test("getOne includes the uploaded image, and it can be deleted", async () => {
    const getRes = await adminAgent.get(`/api/property-listings/${propertyId}`);
    expect(getRes.body.data.images.length).toBeGreaterThanOrEqual(1);

    const imageId = getRes.body.data.images[0].id;
    const deleteRes = await adminAgent.delete(`/api/property-listings/${propertyId}/images/${imageId}`).set("X-CSRF-Token", csrfToken);
    expect(deleteRes.status).toBe(200);
  });
});
