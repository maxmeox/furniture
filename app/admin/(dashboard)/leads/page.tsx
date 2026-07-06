import Link from "next/link";
import { LeadStatus } from "@prisma/client";
import { updateLead } from "@/app/admin/actions";
import { AdminCard, AdminPageHeader, EmptyAdminState, Field, SelectInput, TextArea, TextInput } from "@/components/admin/admin-controls";
import { LeadSalesActions } from "@/components/admin/lead-sales-actions";
import { Button } from "@/components/ui/button";
import { followUpBadgeClass, followUpBadgeLabel, getFollowUpState } from "@/lib/follow-up";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const leadStatusLabels: Record<LeadStatus, string> = {
  new: "جديد",
  interested: "تم التواصل",
  asked_price: "سأل عن السعر",
  wants_customization: "يريد تفصيل",
  waiting_reply: "بانتظار رد",
  follow_up_needed: "يحتاج متابعة",
  deal_agreed: "تم الاتفاق",
  sold: "تم البيع",
  lost: "غير مكتمل"
};

function dateInput(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; campaign?: string; product?: string; followUp?: string; page?: string; error?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 50;
  const skip = (page - 1) * pageSize;
  const qFilter = params.q
    ? [
        { manualName: { contains: params.q, mode: "insensitive" as const } },
        { manualPhone: { contains: params.q, mode: "insensitive" as const } },
        { generatedMessage: { contains: params.q, mode: "insensitive" as const } },
        { deliveryArea: { contains: params.q, mode: "insensitive" as const } }
      ]
    : undefined;
  const statusFilter = params.status && params.status !== "all" ? params.status as LeadStatus : undefined;
  const [rawLeads, totalCount, products, statusSummary, followUpLeads] = await Promise.all([
    prisma.lead.findMany({
      where: { status: statusFilter, utmCampaign: params.campaign || undefined, productId: params.product || undefined, OR: qFilter },
      include: { product: true, fabric: true, offer: true, campaign: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize
    }),
    prisma.lead.count({ where: { status: statusFilter, utmCampaign: params.campaign || undefined, productId: params.product || undefined, OR: qFilter } }),
    prisma.product.findMany({ select: { id: true, titleAr: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.lead.findMany({ where: { followUpAt: { not: null } }, select: { followUpAt: true } })
  ]);
  const totalPages = Math.ceil(totalCount / pageSize);
  const leads = rawLeads.filter((lead) => {
    if (!params.followUp || params.followUp === "all") return true;
    return getFollowUpState(lead.followUpAt) === params.followUp;
  });
  const statusCounts = new Map(statusSummary.map((item) => [item.status, item._count]));
  const followUpCounts = followUpLeads.reduce(
    (acc, lead) => {
      const state = getFollowUpState(lead.followUpAt);
      if (state === "overdue") acc.overdue += 1;
      if (state === "today") acc.today += 1;
      if (state === "upcoming") acc.upcoming += 1;
      return acc;
    },
    { overdue: 0, today: 0, upcoming: 0 }
  );

  return (
    <section className="space-y-6">
      <AdminPageHeader title="العملاء والطلبات" description="متابعة طلبات واتساب، الحالة، الملاحظات، ومواعيد المتابعة بدون حسابات عملاء." />
      {params.error ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{params.error}</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <LeadSummaryCard label="جديد" value={statusCounts.get(LeadStatus.new) ?? 0} href="/admin/leads?status=new" />
        <LeadSummaryCard label="تم التواصل" value={(statusCounts.get(LeadStatus.interested) ?? 0) + (statusCounts.get(LeadStatus.asked_price) ?? 0) + (statusCounts.get(LeadStatus.wants_customization) ?? 0)} href="/admin/leads?status=interested" />
        <LeadSummaryCard label="يحتاج متابعة" value={statusCounts.get(LeadStatus.follow_up_needed) ?? 0} href="/admin/leads?status=follow_up_needed" />
        <LeadSummaryCard label="متأخر" value={followUpCounts.overdue} href="/admin/leads?followUp=overdue" tone="danger" />
        <LeadSummaryCard label="اليوم" value={followUpCounts.today} href="/admin/leads?followUp=today" tone="warning" />
        <LeadSummaryCard label="قادم" value={followUpCounts.upcoming} href="/admin/leads?followUp=upcoming" tone="success" />
      </div>
      <AdminCard title="بحث وتصفية">
        <form className="grid gap-4 lg:grid-cols-6">
          <Field label="الحالة"><SelectInput name="status" defaultValue={params.status ?? "all"}><option value="all">الكل</option>{Object.values(LeadStatus).map((status) => <option key={status} value={status}>{leadStatusLabels[status]}</option>)}</SelectInput></Field>
          <Field label="بحث"><TextInput name="q" defaultValue={params.q ?? ""} placeholder="اسم، هاتف، منطقة..." /></Field>
          <Field label="الحملة"><TextInput name="campaign" defaultValue={params.campaign ?? ""} /></Field>
          <Field label="منتج"><SelectInput name="product" defaultValue={params.product ?? ""}><option value="">كل المنتجات</option>{products.map((product) => <option key={product.id} value={product.id}>{product.titleAr}</option>)}</SelectInput></Field>
          <Field label="المتابعة">
            <SelectInput name="followUp" defaultValue={params.followUp ?? "all"}>
              <option value="all">الكل</option>
              <option value="overdue">متأخر</option>
              <option value="today">اليوم</option>
              <option value="upcoming">قادم</option>
            </SelectInput>
          </Field>
          <div className="flex items-end"><Button type="submit">تطبيق</Button></div>
        </form>
      </AdminCard>
      <AdminCard title="آخر العملاء">
        {leads.length === 0 ? <EmptyAdminState label="لا توجد عملاء مطابقون. عندما يضغط الزائر واتساب أو يرسل قائمة اهتمام، ستظهر البيانات هنا." /> : (
          <>
          <div className="grid gap-4">
            {leads.map((lead) => {
              const followUpState = getFollowUpState(lead.followUpAt);
              return (
              <div key={lead.id} className="grid gap-4 rounded-2xl bg-white p-4 ring-1 ring-border xl:grid-cols-[1fr_420px]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">{leadStatusLabels[lead.status]}</span>
                    {followUpState ? <span className={`rounded-full px-3 py-1 text-xs font-bold ${followUpBadgeClass(followUpState)}`}>{followUpBadgeLabel(followUpState)}</span> : null}
                    <span className="text-sm text-muted-foreground">{lead.createdAt.toLocaleString("en-GB")}</span>
                    {lead.utmCampaign ? <span className="rounded-full bg-[#f4eadb] px-3 py-1 text-xs font-bold">حملة: {lead.utmCampaign}</span> : null}
                  </div>
                  <div className="grid gap-2 text-sm lg:grid-cols-2">
                    <div><b>المنتج:</b> {lead.product?.titleAr ?? lead.productId ?? "-"}</div>
                    <div><b>القماش:</b> {lead.fabric?.nameAr ?? lead.selectedFabric ?? "-"}</div>
                    <div><b>العرض:</b> {lead.offer?.titleAr ?? lead.offerSlug ?? "-"}</div>
                    <div><b>منطقة التوصيل:</b> {lead.deliveryArea ?? "-"}</div>
                    <div><b>نوع الطلب:</b> {lead.inquiryType ?? "-"}</div>
                    <div><b>المصدر:</b> {lead.utmSource ?? lead.source}</div>
                  </div>
                  <textarea readOnly className="min-h-32 w-full rounded-xl border border-border bg-muted/40 p-3 text-xs leading-6" value={lead.generatedMessage ?? lead.message ?? ""} />
                  <LeadSalesActions phone={lead.manualPhone ?? lead.phone} customerName={lead.manualName ?? lead.name} productTitle={lead.product?.titleAr ?? lead.offer?.titleAr ?? null} />
                </div>
                <form action={updateLead} className="grid gap-3">
                  <input type="hidden" name="id" value={lead.id} />
                  <Field label="الحالة"><SelectInput name="status" defaultValue={lead.status}>{Object.values(LeadStatus).map((status) => <option key={status} value={status}>{leadStatusLabels[status]}</option>)}</SelectInput></Field>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <Field label="اسم العميل"><TextInput name="manualName" defaultValue={lead.manualName ?? lead.name ?? ""} /></Field>
                    <Field label="هاتف العميل"><TextInput name="manualPhone" defaultValue={lead.manualPhone ?? lead.phone ?? ""} /></Field>
                  </div>
                  <Field label="تاريخ المتابعة"><TextInput name="followUpAt" type="date" defaultValue={dateInput(lead.followUpAt)} /></Field>
                  <Field label="ملاحظات"><TextArea name="notes" defaultValue={lead.notes ?? ""} /></Field>
                  <Button type="submit" aria-label="تحديث Lead">تحديث العميل</Button>
                </form>
              </div>
            );})}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => {
                const p = i + 1;
                const sp = new URLSearchParams();
                Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
                sp.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/admin/leads?${sp.toString()}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-colors ${p === page ? "bg-primary text-primary-foreground" : "bg-card text-foreground ring-1 ring-border hover:bg-muted"}`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          ) : null}
          </>
        )}
      </AdminCard>
    </section>
  );
}

function LeadSummaryCard({ label, value, href, tone = "default" }: { label: string; value: number; href: string; tone?: "default" | "danger" | "warning" | "success" }) {
  const className =
    tone === "danger"
      ? "rounded-2xl bg-red-50 p-5 shadow-sm ring-1 ring-red-100"
      : tone === "warning"
        ? "rounded-2xl bg-[#fff3c4] p-5 shadow-sm ring-1 ring-[#ead98b]"
        : tone === "success"
          ? "rounded-2xl bg-green-50 p-5 shadow-sm ring-1 ring-green-100"
          : "rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border";
  return (
    <Link href={href} className={className}>
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </Link>
  );
}
