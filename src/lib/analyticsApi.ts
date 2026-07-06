import { apiFetch } from "./api";
import type { AnalyticsOverview } from "../types/analytics";

interface OverviewResponse {
  data: AnalyticsOverview;
}

export function getAnalyticsOverview() {
  return apiFetch<OverviewResponse>("/analytics");
}
