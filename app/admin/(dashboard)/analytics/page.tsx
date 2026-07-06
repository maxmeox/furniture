import Link from "next/link";
import { Suspense } from "react";
import { AdminCard, AdminPageHeader, EmptyAdminState } from "@/components/admin/admin-controls";
import { TopProductsChart, TrafficSourcesChart } from "@/components/admin/analytics-charts";
import {
  analyticsRangeLabels,
  getAnalyticsOverview,
  getRecentActivityAnalytics,
  getTopCampaignsAnalytics,
  getTopProductsAnalytics,
  getTrafficSourcesAnalytics,
  parseAnalyticsRange,
  type AnalyticsRange
} from "@/lib/analytics";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const params = await searchParams;
  const range = parseAnalyticsRange(params.range);

  return (
    <section className="space-y-6">
      <AdminPageHeader title="الإحصائيات" description="مؤشرات عملية تساعد صاحب المعرض على فهم التفاعل، ضغطات واتساب، المنتجات، والحملات. الأرقام مبنية على أحداث الموقع وليست نظام زوار فريدين." />
      <RangeTabs active={range} />

      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewSection range={range} />
      </Suspense>

      <Suspense fallback={<CardSkeleton title="الرسوم البيانية" />}>
        <ChartsSection range={range} />
      </Suspense>

      <div className="grid gap-6 xl:grid-cols-2">
        <Suspense fallback={<CardSkeleton title="أفضل المنتجات" />}>
          <TopProductsSection range={range} />
        </Suspense>
        <Suspense fallback={<CardSkeleton title="أفضل الحملات" />}>
          <TopCampaignsSection range={range} />
        </Suspense>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Suspense fallback={<CardSkeleton title="مصادر الزيارات" />}>
          <TrafficSourcesSection range={range} />
        </Suspense>
        <Suspense fallback={<CardSkeleton title="آخر النشاطات" />}>
          <RecentActivitySection range={range} />
        </Suspense>
      </div>
    </section>
  );
}

async function OverviewSection({ range }: { range: AnalyticsRange }) {
  const analytics = await getAnalyticsOverview(range);
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <OverviewCard label="كل التفاعلات" value={analytics.overview.totalEvents} helper={analytics.rangeLabel} />
        <OverviewCard label="مشاهدات المنتجات" value={analytics.overview.productViews} helper="فتح صفحات المنتجات" />
        <OverviewCard label="مشاهدات الحملات" value={analytics.overview.campaignViews} helper="فتح صفحات الحملات" />
        <OverviewCard label="ضغطات واتساب" value={analytics.overview.whatsappClicks} helper="فتح محادثة أو إرسال طلب" />
        <OverviewCard label="عملاء جدد" value={analytics.overview.totalLeads} helper="طلبات محفوظة في النظام" />
      </div>

      <AdminCard title="ما الذي تقوله الأرقام؟">
        {analytics.insights.length === 0 ? (
          <div className="text-sm text-muted-foreground">لا توجد ملاحظات كافية ضمن الفترة المختارة.</div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {analytics.insights.map((insight) => (
              <li key={insight} className="rounded-2xl bg-white p-4 text-sm font-semibold leading-7 ring-1 ring-border">{insight}</li>
            ))}
          </ul>
        )}
      </AdminCard>
    </>
  );
}

async function ChartsSection({ range }: { range: AnalyticsRange }) {
  const [products, sources] = await Promise.all([
    getTopProductsAnalytics(range),
    getTrafficSourcesAnalytics(range)
  ]);
  const chartData = products.map((p) => ({ name: p.title, views: p.views, whatsappClicks: p.whatsappClicks, interestAdds: p.interestAdds }));
  const sourceData = sources.map((s) => ({ name: s.source && s.medium ? `${s.source} / ${s.medium}` : (s.source || s.medium || ""), value: s.count }));
  return (
    <AdminCard title="الرسوم البيانية">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-bold text-muted-foreground">أفضل المنتجات</h3>
          <TopProductsChart data={chartData} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold text-muted-foreground">مصادر الزيارات</h3>
          <TrafficSourcesChart data={sourceData} />
        </div>
      </div>
    </AdminCard>
  );
}

async function TopProductsSection({ range }: { range: AnalyticsRange }) {
  const products = await getTopProductsAnalytics(range);
  return (
    <AdminCard title="أفضل المنتجات">
      {products.length === 0 ? (
        <EmptyAdminState label="لا توجد بيانات منتجات بعد. ستظهر بعد أن يفتح الزوار صفحات المنتجات أو يضغطوا واتساب." />
      ) : (
        <ResponsiveTable>
          <thead className="text-muted-foreground">
            <tr className="border-b border-border text-right"><th className="py-3">التصميم</th><th>الكود</th><th>مشاهدات</th><th>واتساب</th><th>اهتمام</th></tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className="border-b border-border/70">
                <td className="py-3 font-bold">{product.title}</td>
                <td className="text-muted-foreground">{product.code || product.slug}</td>
                <td>{product.views}</td>
                <td>{product.whatsappClicks}</td>
                <td>{product.interestAdds}</td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      )}
    </AdminCard>
  );
}

async function TopCampaignsSection({ range }: { range: AnalyticsRange }) {
  const campaigns = await getTopCampaignsAnalytics(range);
  return (
    <AdminCard title="أفضل الحملات">
      {campaigns.length === 0 ? (
        <EmptyAdminState label="لا توجد بيانات حملات بعد. ستظهر بعد مشاركة روابط الحملات مع UTM أو QR." />
      ) : (
        <ResponsiveTable>
          <thead className="text-muted-foreground">
            <tr className="border-b border-border text-right"><th className="py-3">الحملة</th><th>مشاهدات</th><th>واتساب</th><th>Leads</th><th>نسبة واتساب</th></tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.slug} className="border-b border-border/70">
                <td className="py-3">
                  <div className="font-bold">{campaign.title}</div>
                  <div className="break-all text-xs text-muted-foreground">{campaign.slug}</div>
                </td>
                <td>{campaign.views}</td>
                <td>{campaign.whatsappClicks}</td>
                <td>{campaign.leads}</td>
                <td>{campaign.conversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      )}
    </AdminCard>
  );
}

async function TrafficSourcesSection({ range }: { range: AnalyticsRange }) {
  const trafficSources = await getTrafficSourcesAnalytics(range);
  return (
    <AdminCard title="مصادر الزيارات">
      {trafficSources.length === 0 ? (
        <EmptyAdminState label="لا توجد مصادر زيارات ضمن الفترة المختارة." />
      ) : (
        <ul className="space-y-2 text-sm">
          {trafficSources.map((source) => (
            <li key={`${source.source}-${source.medium}`} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-border">
              <span className="min-w-0 truncate">{source.source} / {source.medium}</span>
              <b>{source.count}</b>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}

async function RecentActivitySection({ range }: { range: AnalyticsRange }) {
  const recentEvents = await getRecentActivityAnalytics(range);
  return (
    <AdminCard title="آخر النشاطات">
      {recentEvents.length === 0 ? (
        <EmptyAdminState label="لا توجد نشاطات بعد. تظهر هنا المشاهدات، ضغطات واتساب، وإضافات قائمة الاهتمام." />
      ) : (
        <div className="grid gap-3">
          {recentEvents.map((event) => (
            <div key={event.id} className="grid gap-1 rounded-xl bg-white p-3 text-sm ring-1 ring-border md:grid-cols-[180px_1fr_auto] md:items-center">
              <div className="font-bold">{event.label}</div>
              <div className="min-w-0 break-words text-muted-foreground">{event.entityId ?? event.utmCampaign ?? event.path ?? "صفحة عامة"}</div>
              <div className="text-xs text-muted-foreground">{event.createdAt.toLocaleString("en-GB")}</div>
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  );
}

function RangeTabs({ active }: { active: AnalyticsRange }) {
  const ranges: AnalyticsRange[] = ["today", "7d", "30d", "all"];
  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <Link
          key={range}
          href={`/admin/analytics?range=${range}`}
          className={range === active ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" : "rounded-full bg-card px-4 py-2 text-sm font-bold text-muted-foreground ring-1 ring-border hover:text-foreground"}
        >
          {analyticsRangeLabels[range]}
        </Link>
      ))}
    </div>
  );
}

function OverviewCard({ label, value, helper }: { label: string; value: number | string; helper: string }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      <div className="mt-2 text-xs leading-6 text-muted-foreground">{helper}</div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-3 h-8 w-14 rounded bg-muted" />
            <div className="mt-3 text-xs text-muted-foreground">جاري تحميل المؤشرات...</div>
          </div>
        ))}
      </div>
      <AdminCard title="ما الذي تقوله الأرقام؟">
        <div className="text-sm text-muted-foreground">جاري تحميل المؤشرات...</div>
      </AdminCard>
    </>
  );
}

function CardSkeleton({ title }: { title: string }) {
  return (
    <AdminCard title={title}>
      <div className="space-y-3 text-sm text-muted-foreground">
        <div>جاري تحميل هذا القسم...</div>
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </AdminCard>
  );
}

function ResponsiveTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">{children}</table>
    </div>
  );
}
