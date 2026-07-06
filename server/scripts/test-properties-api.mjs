import { BASE_URL, extractCookie, getCsrfToken, buildHeaders, makeChecker } from "./testHelpers.mjs";

const { check, summary } = makeChecker();

async function run() {
  const { csrfToken, csrfCookie } = await getCsrfToken();

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: buildHeaders({ csrfToken, csrfCookie }),
    body: JSON.stringify({ username: "admin", password: "Admin@12345" }),
  });
  check("admin login succeeds", loginRes.status, 200);
  const cookie = extractCookie(loginRes);
  const authHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: cookie });

  // No auth at all
  const noAuthRes = await fetch(`${BASE_URL}/property-listings`);
  check("list without auth is 401", noAuthRes.status, 401);

  // Validation failures
  const missingFieldsRes = await fetch(`${BASE_URL}/property-listings`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ title: "ab" }),
  });
  check("create with missing/invalid fields is 400", missingFieldsRes.status, 400);

  const badPriceRes = await fetch(`${BASE_URL}/property-listings`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Nice villa",
      description: "A lovely villa",
      price: -50,
      location: "Hargeisa",
      type: "sale",
    }),
  });
  check("create with negative price is 400", badPriceRes.status, 400);

  const badTypeRes = await fetch(`${BASE_URL}/property-listings`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Nice villa",
      description: "A lovely villa",
      price: 100,
      location: "Hargeisa",
      type: "lease",
    }),
  });
  check("create with invalid type is 400", badTypeRes.status, 400);

  // Create several properties to exercise search/filter/pagination
  const seed = [
    { title: "Sunset Villa", description: "Spacious villa near the coast", price: 250000, location: "Jigjiga Yar", type: "sale", status: "available" },
    { title: "Downtown Apartment", description: "Modern apartment in the city center", price: 800, location: "Hargeisa Central", type: "rent", status: "available" },
    { title: "Sunset Apartment", description: "Cozy flat with a view", price: 650, location: "26 June", type: "rent", status: "rented" },
    { title: "Industrial Warehouse", description: "Large storage warehouse", price: 500000, location: "Mohamed Mooge", type: "sale", status: "sold" },
  ];

  const created = [];
  for (const payload of seed) {
    const res = await fetch(`${BASE_URL}/property-listings`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    check(`create "${payload.title}" succeeds`, res.status, 201);
    created.push(body.data);
  }

  // Get by id
  const getOneRes = await fetch(`${BASE_URL}/property-listings/${created[0].id}`, { headers: authHeaders });
  check("get by id succeeds", getOneRes.status, 200);

  // Get missing id
  const getMissingRes = await fetch(`${BASE_URL}/property-listings/999999`, { headers: authHeaders });
  check("get missing id is 404", getMissingRes.status, 404);

  // Search (partial, case-insensitive) on title/location
  const searchRes = await fetch(`${BASE_URL}/property-listings?search=sunset`, { headers: authHeaders });
  const searchBody = await searchRes.json();
  check("search 'sunset' finds 2 results", searchBody.data.filter((p) => seed.some((s) => s.title === p.title)).length >= 2, true);

  // Filter by type
  const rentRes = await fetch(`${BASE_URL}/property-listings?type=rent`, { headers: authHeaders });
  const rentBody = await rentRes.json();
  check("filter type=rent returns only rent listings", rentBody.data.every((p) => p.type === "rent"), true);

  // Filter by status
  const soldRes = await fetch(`${BASE_URL}/property-listings?status=sold`, { headers: authHeaders });
  const soldBody = await soldRes.json();
  check("filter status=sold returns only sold listings", soldBody.data.every((p) => p.status === "sold"), true);

  // Price range filter
  const priceRangeRes = await fetch(`${BASE_URL}/property-listings?min_price=600&max_price=900`, { headers: authHeaders });
  const priceRangeBody = await priceRangeRes.json();
  check(
    "price range filter respects bounds",
    priceRangeBody.data.every((p) => Number(p.price) >= 600 && Number(p.price) <= 900),
    true
  );

  // Combined filter + search + pagination
  const combinedRes = await fetch(
    `${BASE_URL}/property-listings?type=rent&search=apartment&page=1&limit=1`,
    { headers: authHeaders }
  );
  const combinedBody = await combinedRes.json();
  check("combined filter+search+pagination returns 1 item (limit=1)", combinedBody.data.length, 1);
  check("combined filter+search meta has pagination fields", typeof combinedBody.meta.totalPages, "number");

  // Pagination metadata sanity on unfiltered list
  const page1Res = await fetch(`${BASE_URL}/property-listings?page=1&limit=2`, { headers: authHeaders });
  const page1Body = await page1Res.json();
  check("page=1&limit=2 returns at most 2 items", page1Body.data.length <= 2, true);
  check("meta.currentPage reflects requested page", page1Body.meta.currentPage, 1);
  check("meta.limit reflects requested limit", page1Body.meta.limit, 2);

  // Update
  const updateRes = await fetch(`${BASE_URL}/property-listings/${created[0].id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ ...seed[0], price: 275000, status: "sold" }),
  });
  const updateBody = await updateRes.json();
  check("update succeeds", updateRes.status, 200);
  check("update reflects new price", Number(updateBody.data.price), 275000);
  check("update reflects new status", updateBody.data.status, "sold");

  // Update missing id
  const updateMissingRes = await fetch(`${BASE_URL}/property-listings/999999`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify(seed[0]),
  });
  check("update missing id is 404", updateMissingRes.status, 404);

  // Delete
  const deleteRes = await fetch(`${BASE_URL}/property-listings/${created[0].id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  check("delete succeeds", deleteRes.status, 200);

  const getDeletedRes = await fetch(`${BASE_URL}/property-listings/${created[0].id}`, { headers: authHeaders });
  check("get deleted id is 404", getDeletedRes.status, 404);

  // Cleanup remaining seeded properties
  for (const property of created.slice(1)) {
    await fetch(`${BASE_URL}/property-listings/${property.id}`, { method: "DELETE", headers: authHeaders });
  }

  const failed = summary();
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Test script crashed:", err);
  process.exit(1);
});
