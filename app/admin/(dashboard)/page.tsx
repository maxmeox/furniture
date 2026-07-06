import Link from "next/link";
import { PublishStatus } from "@prisma/client";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-controls";
import { ShareQrActions } from "@/components/admin/share-qr-actions";
import { Button } from "@/components/ui/button";
import { getOwnerDashboardSummary } from "@/lib/analytics";
import { productNeedsAttention, productQualityLabel } from "@/lib/product-quality";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/constants";

export default async function AdminPage() {
  const [counts, analytics, productAttention, campaigns] = await Promise.all([
    Promise.all([
      prisma.product.count(),
      prisma.fabric.count(),
      prisma.offer.count(),
      prisma.galleryItem.count(),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "new" } })
    ]),
    getOwnerDashboardSummary(),
    prisma.product.findMany({
      include: { images: { select: { id: true } }, _count: { select: { productFabrics: true } } },
      orderBy: { updatedAt: "desc" },
      take: 60
    }),
    prisma.campaign.findMany({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }]
    })
  ]);
  const [totalProducts, totalFabrics, totalOffers, totalGalleryItems, totalLeads, newLeads] = counts;
  const productsNeedingAttention = productAttention.filter(productNeedsAttention).slice(0, 5);
  const bestProduct = analytics.topProducts[0];
  const bestCampaign = analytics.topCampaigns[0];

  return (
    <section className="space-y-6">
      <AdminPageHeader title="لوحة التحكم" description="نظرة عملية على الكتالوج، العملاء، واتساب، والحملات." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="تفاعلات آخر 7 أيام" value={analytics.overview.totalEvents} helper="أحداث الموقع المسجلة، وليست زوارًا فريدين." href="/admin/analytics" />
        <MetricCard label="ضغطات واتساب" value={analytics.overview.whatsappClicks} helper="محاولات فتح محادثة واتساب." href="/admin/analytics" />
        <MetricCard label="عملاء جدد" value={newLeads} helper="Leads بحالة جديدة." href="/admin/leads?status=new" />
        <MetricCard label="يحتاجون متابعة" value={analytics.followUps.overdue + analytics.followUps.today} helper={`${analytics.followUps.overdue} متأخر · ${analytics.followUps.today} اليوم`} href="/admin/leads?followUp=overdue" />
        <MetricCard label="الحملات النشطة" value={analytics.overview.activeCampaigns} helper="حملات منشورة قابلة للمشاركة." href="/admin/campaigns" />
        <MetricCard label="منتجات منشورة" value={analytics.overview.publishedProducts} helper="تصاميم ظاهرة للزوار." href="/admin/products" />
        <MetricCard label="أكثر منتج مشاهدة" value={bestProduct?.views ?? 0} helper={bestProduct?.title ?? "لا توجد مشاهدات بعد."} href="/admin/analytics" />
        <MetricCard label="أفضل حملة أداءً" value={bestCampaign?.views ?? 0} helper={bestCampaign?.title ?? "لا توجد بيانات حملات بعد."} href="/admin/analytics" />
      </div>

      <AdminCard title="ما الذي يحتاج انتباهك؟">
        {analytics.insights.length === 0 ? (
          <div className="text-sm text-muted-foreground">لا توجد ملاحظات مهمة الآن. ستظهر التوصيات بعد تفاعل الزوار مع الموقع.</div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {analytics.insights.map((insight) => (
              <li key={insight} className="rounded-2xl bg-white p-4 text-sm font-semibold leading-7 ring-1 ring-border">{insight}</li>
            ))}
          </ul>
        )}
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {[
          ["المنتجات", totalProducts, "/admin/products"],
          ["الأقمشة", totalFabrics, "/admin/fabrics"],
          ["العروض", totalOffers, "/admin/offers"],
          ["صور المعرض", totalGalleryItems, "/admin/gallery"],
          ["كل العملاء", totalLeads, "/admin/leads"],
          ["عملاء جدد", newLeads, "/admin/leads?status=new"]
        ].map(([label, value, href]) => (
          <Link key={label} href={String(href)} className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5">
            <div className="text-sm font-semibold text-muted-foreground">{label}</div>
            <div className="mt-3 text-3xl font-bold">{value}</div>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Link href="/admin/leads?followUp=overdue" className="rounded-2xl bg-red-50 p-5 shadow-sm ring-1 ring-red-100 transition hover:-translate-y-0.5">
          <div className="text-sm font-semibold text-red-700">متابعات متأخرة</div>
          <div className="mt-3 text-3xl font-bold text-red-800">{analytics.followUps.overdue}</div>
        </Link>
        <Link href="/admin/leads?followUp=today" className="rounded-2xl bg-[#fff3c4] p-5 shadow-sm ring-1 ring-[#ead98b] transition hover:-translate-y-0.5">
          <div className="text-sm font-semibold text-[#6b4a00]">متابعات اليوم</div>
          <div className="mt-3 text-3xl font-bold text-[#5a3f00]">{analytics.followUps.today}</div>
        </Link>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="أحدث العملاء">
          <div className="space-y-3">
            {analytics.recentLeads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="rounded-xl bg-white p-3 ring-1 ring-border">
                <div className="font-bold">{lead.deliveryArea ?? lead.manualName ?? "عميل جديد"}</div>
                <div className="text-sm text-muted-foreground">{lead.status} · {lead.utmCampaign ?? lead.sourcePageUrl ?? "website"}</div>
              </div>
            ))}
            <Button asChild variant="secondary" size="sm"><Link href="/admin/leads">فتح كل العملاء</Link></Button>
          </div>
        </AdminCard>
        <AdminCard title="أحدث الأحداث">
          <div className="space-y-3">
            {analytics.recentEvents.map((event) => (
              <div key={event.id} className="rounded-xl bg-white p-3 ring-1 ring-border">
                <div className="font-bold">{event.label}</div>
                <div className="text-sm text-muted-foreground">{event.entityType ?? "page"} · {event.entityId ?? event.path ?? "-"} · {event.createdAt.toLocaleString("en-GB")}</div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="أكثر المنتجات مشاهدة">
          <ul className="space-y-2 text-sm">
            {analytics.topProducts.slice(0, 6).map((item) => <li key={item.slug} className="flex justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-border"><span className="truncate">{item.title}</span><b>{item.views}</b></li>)}
          </ul>
        </AdminCard>
        <AdminCard title="نقرات واتساب حسب الحملة">
          <ul className="space-y-2 text-sm">
            {analytics.topCampaigns.slice(0, 6).map((item) => <li key={item.slug} className="flex justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-border"><span className="truncate">{item.title}</span><b>{item.whatsappClicks}</b></li>)}
          </ul>
        </AdminCard>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminCard title="منتجات تحتاج تحسين">
          {productsNeedingAttention.length === 0 ? (
            <div className="text-sm text-muted-foreground">كل المنتجات الأساسية تبدو جاهزة للحملة.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {productsNeedingAttention.map((product) => (
                <li key={product.id} className="rounded-xl bg-white p-3 ring-1 ring-border">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/admin/products?edit=${product.id}`} className="font-bold hover:underline">{product.titleAr}</Link>
                    <span className="text-xs text-muted-foreground">{product.images.length} صور</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {productQualityLabel(product).map((label) => (
                      <span key={label} className="rounded-full bg-[#fff3c4] px-2 py-1 text-xs font-bold text-[#6b4a00]">{label}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
        <AdminCard title="المنتجات الأكثر جذبًا">
          <div className="grid gap-4 lg:grid-cols-3">
            <AttractionList title="مشاهدة" rows={analytics.topProducts.map((item): [string, number] => [item.title, item.views])} />
            <AttractionList title="نقر واتساب" rows={analytics.topProducts.map((item): [string, number] => [item.title, item.whatsappClicks]).filter(([, value]) => value > 0)} />
            <AttractionList title="قائمة الاهتمام" rows={analytics.topProducts.map((item): [string, number] => [item.title, item.interestAdds]).filter(([, value]) => value > 0)} />
          </div>
        </AdminCard>
      </div>
      <AdminCard title="روابط QR للحملات الجاهزة">
        <div className="grid gap-3">
          {campaigns.map((campaign) => (
            <div key={campaign.slug} className="flex flex-col gap-3 rounded-xl bg-white p-3 ring-1 ring-border lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-bold">{campaign.titleAr}</div>
                <div className="text-xs text-muted-foreground">/ar/campaigns/{campaign.slug}</div>
              </div>
              <ShareQrActions url={`${appUrl}/ar/campaigns/${campaign.slug}?utm_source=facebook&utm_medium=paid&utm_campaign=${campaign.slug}`} label={campaign.slug} locale="ar" />
            </div>
          ))}
        </div>
      </AdminCard>
    </section>
  );
}

function MetricCard({ label, value, helper, href }: { label: string; value: string | number; helper: string; href: string }) {
  return (
    <Link href={href} className="min-w-0 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5">
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      <div className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground">{helper}</div>
    </Link>
  );
}

function AttractionList({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold text-muted-foreground">{title}</div>
      {rows.length === 0 ? (
        <div className="rounded-xl bg-white p-3 text-xs text-muted-foreground ring-1 ring-border">لا توجد بيانات بعد.</div>
      ) : (
        <ul className="space-y-2 text-xs">
          {rows.slice(0, 5).map(([label, value]) => (
            <li key={`${title}-${label}`} className="flex justify-between gap-2 rounded-xl bg-white p-3 ring-1 ring-border">
              <span className="truncate">{label}</span>
              <b>{value}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
