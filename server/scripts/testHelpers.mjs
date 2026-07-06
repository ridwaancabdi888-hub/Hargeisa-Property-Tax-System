export const BASE_URL = "http://localhost:5000/api";

export function extractCookie(response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return null;
  return setCookie.split(";")[0];
}

// Fetches a CSRF token once (as the browser would on app bootstrap) and returns
// helpers to build headers for authenticated, CSRF-protected mutating requests.
export async function getCsrfToken() {
  const res = await fetch(`${BASE_URL}/csrf-token`);
  const body = await res.json();
  const cookie = extractCookie(res);
  return { csrfToken: body.data.csrfToken, csrfCookie: cookie };
}

export function buildHeaders({ csrfToken, csrfCookie, sessionCookie, json = true }) {
  const cookieParts = [csrfCookie, sessionCookie].filter(Boolean);
  const headers = {
    Cookie: cookieParts.join("; "),
    "X-CSRF-Token": csrfToken,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export function makeChecker() {
  let passed = 0;
  let failed = 0;
  function check(name, actual, expected) {
    const ok = actual === expected;
    console.log(`${ok ? "PASS" : "FAIL"} - ${name} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
    if (ok) passed++;
    else failed++;
    return ok;
  }
  function summary() {
    console.log(`\n${passed} passed, ${failed} failed`);
    return failed;
  }
  return { check, summary };
}
