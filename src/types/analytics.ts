export interface AnalyticsOverview {
  totals: {
    total: number;
    available: number;
    sold: number;
    rented: number;
  };
  revenue: number;
  byType: { type: "rent" | "sale"; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}
