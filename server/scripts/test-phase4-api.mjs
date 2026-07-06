import { BASE_URL, extractCookie, getCsrfToken, buildHeaders, makeChecker } from "./testHelpers.mjs";

const { check, summary } = makeChecker();

async function run() {
  const { csrfToken, csrfCookie } = await getCsrfToken();

  async function login(username, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: buildHeaders({ csrfToken, csrfCookie }),
      body: JSON.stringify({ username, password }),
    });
    return { status: res.status, cookie: extractCookie(res) };
  }

  const admin = await login("admin", "Admin@12345");
  check("admin login succeeds", admin.status, 200);
  const adminHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: admin.cookie });
  const adminUploadHeaders = { Cookie: `${csrfCookie}; ${admin.cookie}`, "X-CSRF-Token": csrfToken };

  // --- Create an agent and a viewer account ---
  const agentUsername = `agent_p4_${Date.now()}`;
  const agentCreateRes = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      fullName: "Phase4 Agent",
      username: agentUsername,
      email: `${agentUsername}@hargeisatax.gov.so`,
      password: "AgentPass123",
      role: "agent",
    }),
  });
  check("admin creates agent account", agentCreateRes.status, 201);

  const viewerUsername = `viewer_p4_${Date.now()}`;
  const viewerCreateRes = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      fullName: "Phase4 Viewer",
      username: viewerUsername,
      email: `${viewerUsername}@hargeisatax.gov.so`,
      password: "ViewerPass123",
      role: "viewer",
    }),
  });
  check("admin creates viewer account", viewerCreateRes.status, 201);

  const agent = await login(agentUsername, "AgentPass123");
  const agentHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: agent.cookie });
  const viewer = await login(viewerUsername, "ViewerPass123");
  const viewerHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: viewer.cookie });

  // --- Permission matrix on properties ---
  const samplePayload = {
    title: "Phase4 Test Property",
    description: "A property used for RBAC testing",
    price: 150000,
    location: "Hargeisa Central",
    type: "sale",
  };

  // Viewer: view OK, create/edit/delete/analytics forbidden
  const viewerListRes = await fetch(`${BASE_URL}/property-listings`, { headers: viewerHeaders });
  check("viewer can view properties (200)", viewerListRes.status, 200);

  const viewerCreateAttempt = await fetch(`${BASE_URL}/property-listings`, {
    method: "POST",
    headers: viewerHeaders,
    body: JSON.stringify(samplePayload),
  });
  check("viewer cannot create properties (403)", viewerCreateAttempt.status, 403);

  const viewerAnalyticsAttempt = await fetch(`${BASE_URL}/analytics`, { headers: viewerHeaders });
  check("viewer cannot view analytics (403)", viewerAnalyticsAttempt.status, 403);

  // Agent: create/edit OK, delete/analytics forbidden
  const agentCreateRes2 = await fetch(`${BASE_URL}/property-listings`, {
    method: "POST",
    headers: agentHeaders,
    body: JSON.stringify(samplePayload),
  });
  check("agent can create properties (201)", agentCreateRes2.status, 201);
  const agentCreatedProperty = (await agentCreateRes2.json()).data;

  const agentUpdateRes = await fetch(`${BASE_URL}/property-listings/${agentCreatedProperty.id}`, {
    method: "PUT",
    headers: agentHeaders,
    body: JSON.stringify({ ...samplePayload, price: 160000 }),
  });
  check("agent can edit properties (200)", agentUpdateRes.status, 200);

  const agentDeleteAttempt = await fetch(`${BASE_URL}/property-listings/${agentCreatedProperty.id}`, {
    method: "DELETE",
    headers: agentHeaders,
  });
  check("agent cannot delete properties (403)", agentDeleteAttempt.status, 403);

  const agentAnalyticsAttempt = await fetch(`${BASE_URL}/analytics`, { headers: agentHeaders });
  check("agent cannot view analytics (403)", agentAnalyticsAttempt.status, 403);

  // Admin: can delete
  const adminDeleteRes = await fetch(`${BASE_URL}/property-listings/${agentCreatedProperty.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  check("admin can delete properties (200)", adminDeleteRes.status, 200);

  const adminAnalyticsRes = await fetch(`${BASE_URL}/analytics`, { headers: adminHeaders });
  check("admin can view analytics (200)", adminAnalyticsRes.status, 200);
  const analyticsBody = await adminAnalyticsRes.json();
  check("analytics response has totals.total field", typeof analyticsBody.data?.totals?.total, "number");
  check("analytics response has byType array", Array.isArray(analyticsBody.data?.byType), true);
  check("analytics response has monthlyTrend array", Array.isArray(analyticsBody.data?.monthlyTrend), true);

  // --- Image upload ---
  const propForImagesRes = await fetch(`${BASE_URL}/property-listings`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(samplePayload),
  });
  const propForImages = (await propForImagesRes.json()).data;

  const validForm = new FormData();
  validForm.append("images", new Blob([Buffer.from([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" }), "test.png");
  const validUploadRes = await fetch(`${BASE_URL}/property-listings/${propForImages.id}/images`, {
    method: "POST",
    headers: adminUploadHeaders,
    body: validForm,
  });
  check("valid PNG image upload succeeds (201)", validUploadRes.status, 201);
  const uploadedImage = (await validUploadRes.json()).data[0];

  const invalidForm = new FormData();
  invalidForm.append("images", new Blob([Buffer.from("not an image")], { type: "text/plain" }), "test.txt");
  const invalidUploadRes = await fetch(`${BASE_URL}/property-listings/${propForImages.id}/images`, {
    method: "POST",
    headers: adminUploadHeaders,
    body: invalidForm,
  });
  check("non-image mimetype is rejected (400)", invalidUploadRes.status, 400);

  const oversizedForm = new FormData();
  oversizedForm.append(
    "images",
    new Blob([Buffer.alloc(6 * 1024 * 1024)], { type: "image/png" }),
    "big.png"
  );
  const oversizedUploadRes = await fetch(`${BASE_URL}/property-listings/${propForImages.id}/images`, {
    method: "POST",
    headers: adminUploadHeaders,
    body: oversizedForm,
  });
  check("oversized file (>5MB) is rejected (400)", oversizedUploadRes.status, 400);

  const getWithImagesRes = await fetch(`${BASE_URL}/property-listings/${propForImages.id}`, { headers: adminHeaders });
  const getWithImagesBody = await getWithImagesRes.json();
  check("getOne includes uploaded image", getWithImagesBody.data.images.length, 1);

  const deleteImageRes = await fetch(
    `${BASE_URL}/property-listings/${propForImages.id}/images/${uploadedImage.id}`,
    { method: "DELETE", headers: adminHeaders }
  );
  check("delete image succeeds (200)", deleteImageRes.status, 200);

  // cleanup
  await fetch(`${BASE_URL}/property-listings/${propForImages.id}`, { method: "DELETE", headers: adminHeaders });

  // --- Notifications ---
  const notifPropRes = await fetch(`${BASE_URL}/property-listings`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ ...samplePayload, title: "Notification Trigger Property", status: "available" }),
  });
  const notifProp = (await notifPropRes.json()).data;

  await fetch(`${BASE_URL}/property-listings/${notifProp.id}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({ ...samplePayload, title: "Notification Trigger Property", status: "sold" }),
  });

  await fetch(`${BASE_URL}/property-listings/${notifProp.id}`, { method: "DELETE", headers: adminHeaders });

  const notifListRes = await fetch(`${BASE_URL}/notifications`, { headers: adminHeaders });
  check("notifications list succeeds (200)", notifListRes.status, 200);
  const notifListBody = await notifListRes.json();
  const messages = notifListBody.data.map((n) => n.message);
  check(
    "created/sold/deleted notifications all present",
    messages.some((m) => m.includes("Notification Trigger Property") && m.includes("added")) &&
      messages.some((m) => m.includes("Notification Trigger Property") && m.includes("marked as sold")) &&
      messages.some((m) => m.includes("Notification Trigger Property") && m.includes("deleted")),
    true
  );
  check("unread count is a number", typeof notifListBody.meta.unreadCount, "number");

  const firstUnread = notifListBody.data.find((n) => !n.isRead);
  if (firstUnread) {
    const markReadRes = await fetch(`${BASE_URL}/notifications/${firstUnread.id}/read`, {
      method: "POST",
      headers: adminHeaders,
    });
    check("mark notification as read succeeds (200)", markReadRes.status, 200);

    const afterMarkRes = await fetch(`${BASE_URL}/notifications`, { headers: adminHeaders });
    const afterMarkBody = await afterMarkRes.json();
    const stillUnread = afterMarkBody.data.find((n) => n.id === firstUnread.id)?.isRead === false;
    check("notification shows as read after marking", stillUnread, false);
  }

  const failed = summary();
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Test script crashed:", err);
  process.exit(1);
});
