"use client";

import dynamic from "next/dynamic";

export const TopProductsChart = dynamic(
  () => import("./analytics-charts-inner").then((m) => m.TopProductsChart),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-muted" /> }
);

export const TrafficSourcesChart = dynamic(
  () => import("./analytics-charts-inner").then((m) => m.TrafficSourcesChart),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-muted" /> }
);
