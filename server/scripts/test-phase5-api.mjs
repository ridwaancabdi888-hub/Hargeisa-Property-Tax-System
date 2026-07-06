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
    return { status: res.status, cookie: extractCookie(res), body: await res.json() };
  }

  // Fresh throwaway account for this test run so we don't disturb the seeded admin
  const username = `phase5_${Date.now()}`;
  const password = "Phase5Pass1";
  const admin = await login("admin", "Admin@12345");
  const adminHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: admin.cookie });
  const adminUploadHeaders = { Cookie: `${csrfCookie}; ${admin.cookie}`, "X-CSRF-Token": csrfToken };

  const createRes = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      fullName: "Phase5 Test User",
      username,
      email: `${username}@hargeisatax.gov.so`,
      password,
    }),
  });
  check("create test user for phase5 suite", createRes.status, 201);

  const user = await login(username, password);
  check("test user login succeeds", user.status, 200);
  let userHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: user.cookie });
  const userUploadHeaders = { Cookie: `${csrfCookie}; ${user.cookie}`, "X-CSRF-Token": csrfToken };

  // ---------- Profile: update ----------
  const updateProfileRes = await fetch(`${BASE_URL}/profile`, {
    method: "PATCH",
    headers: userHeaders,
    body: JSON.stringify({ fullName: "Phase5 Renamed User", email: `${username}@hargeisatax.gov.so` }),
  });
  check("update own profile succeeds", updateProfileRes.status, 200);
  const updateProfileBody = await updateProfileRes.json();
  check("updated profile reflects new fullName", updateProfileBody.data.fullName, "Phase5 Renamed User");

  // Email uniqueness: try to steal the seeded admin's email
  const emailConflictRes = await fetch(`${BASE_URL}/profile`, {
    method: "PATCH",
    headers: userHeaders,
    body: JSON.stringify({ fullName: "Whatever", email: "admin@hargeisatax.gov.so" }),
  });
  check("updating to an email already in use is rejected (409)", emailConflictRes.status, 409);

  // ---------- Profile: change password ----------
  const wrongCurrentRes = await fetch(`${BASE_URL}/profile/password`, {
    method: "PATCH",
    headers: userHeaders,
    body: JSON.stringify({ currentPassword: "totally-wrong", newPassword: "NewPass123" }),
  });
  check("change password with wrong current password is rejected (401)", wrongCurrentRes.status, 401);

  const weakNewPasswordRes = await fetch(`${BASE_URL}/profile/password`, {
    method: "PATCH",
    headers: userHeaders,
    body: JSON.stringify({ currentPassword: password, newPassword: "weak" }),
  });
  check("change password with a weak new password is rejected (400)", weakNewPasswordRes.status, 400);

  const newPassword = "NewPass456";
  const changePasswordRes = await fetch(`${BASE_URL}/profile/password`, {
    method: "PATCH",
    headers: userHeaders,
    body: JSON.stringify({ currentPassword: password, newPassword }),
  });
  check("change password with correct current password succeeds", changePasswordRes.status, 200);

  const oldPasswordLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: buildHeaders({ csrfToken, csrfCookie }),
    body: JSON.stringify({ username, password }),
  });
  check("old password no longer works after change", oldPasswordLoginRes.status, 401);

  const newPasswordLogin = await login(username, newPassword);
  check("new password works after change", newPasswordLogin.status, 200);
  userHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: newPasswordLogin.cookie });

  // ---------- Profile: avatar upload/delete ----------
  const validAvatarForm = new FormData();
  validAvatarForm.append("avatar", new Blob([Buffer.from([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" }), "avatar.png");
  const uploadAvatarRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: "POST",
    headers: userUploadHeaders,
    body: validAvatarForm,
  });
  check("valid avatar upload succeeds (200)", uploadAvatarRes.status, 200);
  const uploadAvatarBody = await uploadAvatarRes.json();
  check("uploaded avatar URL is set", typeof uploadAvatarBody.data.avatarUrl, "string");

  const invalidAvatarForm = new FormData();
  invalidAvatarForm.append("avatar", new Blob([Buffer.from("not an image")], { type: "text/plain" }), "avatar.txt");
  const invalidAvatarRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: "POST",
    headers: userUploadHeaders,
    body: invalidAvatarForm,
  });
  check("non-image avatar mimetype is rejected (400)", invalidAvatarRes.status, 400);

  const oversizedAvatarForm = new FormData();
  oversizedAvatarForm.append("avatar", new Blob([Buffer.alloc(6 * 1024 * 1024)], { type: "image/png" }), "big.png");
  const oversizedAvatarRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: "POST",
    headers: userUploadHeaders,
    body: oversizedAvatarForm,
  });
  check("oversized avatar (>5MB) is rejected (400)", oversizedAvatarRes.status, 400);

  const deleteAvatarRes = await fetch(`${BASE_URL}/profile/avatar`, { method: "DELETE", headers: userHeaders });
  check("delete avatar succeeds (200)", deleteAvatarRes.status, 200);
  const deleteAvatarBody = await deleteAvatarRes.json();
  check("avatar URL cleared after delete", deleteAvatarBody.data.avatarUrl, null);

  // ---------- Settings ----------
  const getSettingsRes = await fetch(`${BASE_URL}/settings`, { headers: userHeaders });
  check("get settings succeeds (lazily creates defaults)", getSettingsRes.status, 200);
  const getSettingsBody = await getSettingsRes.json();
  check("default theme is light", getSettingsBody.data.theme, "light");

  const updateSettingsRes = await fetch(`${BASE_URL}/settings`, {
    method: "PUT",
    headers: userHeaders,
    body: JSON.stringify({ theme: "dark", dateFormat: "DD/MM/YYYY", notifyPropertySold: false }),
  });
  check("update settings succeeds", updateSettingsRes.status, 200);
  const updateSettingsBody = await updateSettingsRes.json();
  check("theme updated to dark", updateSettingsBody.data.theme, "dark");
  check("dateFormat updated", updateSettingsBody.data.dateFormat, "DD/MM/YYYY");
  check("notifyPropertySold updated to false", updateSettingsBody.data.notifyPropertySold, false);

  const invalidThemeRes = await fetch(`${BASE_URL}/settings`, {
    method: "PUT",
    headers: userHeaders,
    body: JSON.stringify({ theme: "blue" }),
  });
  check("invalid theme value is rejected (400)", invalidThemeRes.status, 400);

  // ---------- Activity log (admin-only) ----------
  const userActivityAttempt = await fetch(`${BASE_URL}/activity-logs`, { headers: userHeaders });
  check("non-admin cannot view activity logs (403)", userActivityAttempt.status, 403);

  // Generate a property create/update/delete to produce activity log entries
  const propRes = await fetch(`${BASE_URL}/property-listings`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Phase5 Activity Log Property",
      description: "Used to generate activity log entries",
      price: 99999,
      location: "Hargeisa",
      type: "sale",
    }),
  });
  const prop = (await propRes.json()).data;
  await fetch(`${BASE_URL}/property-listings/${prop.id}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Phase5 Activity Log Property",
      description: "Used to generate activity log entries",
      price: 88888,
      location: "Hargeisa",
      type: "sale",
    }),
  });
  await fetch(`${BASE_URL}/property-listings/${prop.id}`, { method: "DELETE", headers: adminHeaders });

  const activityListRes = await fetch(`${BASE_URL}/activity-logs?limit=50`, { headers: adminHeaders });
  check("admin can view activity logs (200)", activityListRes.status, 200);
  const activityListBody = await activityListRes.json();
  const actions = activityListBody.data.map((l) => l.action);
  check("activity log contains 'login'", actions.includes("login"), true);
  check("activity log contains 'property_created'", actions.includes("property_created"), true);
  check("activity log contains 'property_updated'", actions.includes("property_updated"), true);
  check("activity log contains 'property_deleted'", actions.includes("property_deleted"), true);
  check("activity log contains 'profile_updated'", actions.includes("profile_updated"), true);
  check("activity log contains 'password_changed'", actions.includes("password_changed"), true);

  const propertyLogEntry = activityListBody.data.find((l) => l.action === "property_updated" && l.entityId === prop.id);
  check("property_updated log entry has oldValues/newValues", Boolean(propertyLogEntry?.oldValues && propertyLogEntry?.newValues), true);
  check("property_updated log captures price change", propertyLogEntry?.oldValues?.price !== propertyLogEntry?.newValues?.price, true);

  // Filter by action
  const actionFilterRes = await fetch(`${BASE_URL}/activity-logs?action=property_deleted`, { headers: adminHeaders });
  const actionFilterBody = await actionFilterRes.json();
  check("filter action=property_deleted returns only that action", actionFilterBody.data.every((l) => l.action === "property_deleted"), true);

  // Search
  const searchRes = await fetch(`${BASE_URL}/activity-logs?search=${encodeURIComponent("Phase5 Activity Log Property")}`, {
    headers: adminHeaders,
  });
  const searchBody = await searchRes.json();
  check("search finds matching activity log entries", searchBody.data.length >= 3, true);

  // Pagination
  const pageRes = await fetch(`${BASE_URL}/activity-logs?page=1&limit=2`, { headers: adminHeaders });
  const pageBody = await pageRes.json();
  check("activity log pagination returns at most 2 items", pageBody.data.length <= 2, true);
  check("activity log meta has pagination fields", typeof pageBody.meta.totalPages, "number");

  const failed = summary();
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Test script crashed:", err);
  process.exit(1);
});
