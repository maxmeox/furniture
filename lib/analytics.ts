import { EventType, LeadStatus, PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AnalyticsRange = "today" | "7d" | "30d" | "all";

export const analyticsRangeLabels: Record<AnalyticsRange, string> = {
  today: "اليوم",
  "7d": "آخر 7 أيام",
  "30d": "آخر 30 يوم",
  all: "الكل"
};

const eventLabels: Record<EventType, string> = {
  page_view: "زيارة صفحة",
  whatsapp_click: "ضغطة واتساب",
  lead_created: "عميل جديد",
  campaign_visit: "زيارة حملة",
  admin_action: "إجراء إداري",
  product_viewed: "مشاهدة منتج",
  interest_item_added: "إضافة للاهتمام",
  interest_item_removed: "إزالة من الاهتمام",
  interest_list_sent: "إرسال قائمة اهتمام",
  fabric_selected: "اختيار قماش",
  offer_viewed: "مشاهدة عرض",
  campaign_viewed: "مشاهدة حملة",
  gallery_opened: "فتح المعرض"
};

function startDateForRange(range: AnalyticsRange) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (range === "all") {
    start.setDate(start.getDate() - 90);
    return start;
  }
  if (range === "7d") start.setDate(start.getDate() - 6);
  if (range === "30d") start.setDate(start.getDate() - 29);
  return start;
}

function dateWhere(range: AnalyticsRange) {
  const start = startDateForRange(range);
  return start ? { createdAt: { gte: start } } : {};
}

function followUpDateBounds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
}

function addCount(map: Map<string, number>, key: string | null | undefined, count: number) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + count);
}

function countFor(map: Map<string, number>, key: string) {
  return map.get(key) ?? 0;
}

function conversionRate(clicks: number, views: number) {
  return views > 0 ? Math.round((clicks / views) * 100) : 0;
}

function safeRange(range?: string): AnalyticsRange {
  if (range === "today" || range === "7d" || range === "30d" || range === "all") return range;
  return "7d";
}

export function parseAnalyticsRange(range?: string) {
  return safeRange(range);
}

export function getEventLabel(type: EventType | string) {
  return eventLabels[type as EventType] ?? type;
}

export async function getAnalyticsOverview(rangeInput: AnalyticsRange = "7d") {
  const range = safeRange(rangeInput);
  const where = dateWhere(range);
  const followUpBounds = followUpDateBounds();
  const [
    eventTypeGroups,
    activeCampaigns,
    publishedProducts,
    leadsByStatus,
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps
  ] = await Promise.all([
    prisma.event.groupBy({ by: ["type"], where, _count: true }),
    prisma.campaign.count({ where: { status: PublishStatus.published } }),
    prisma.product.count({ where: { status: PublishStatus.published } }),
    prisma.lead.groupBy({ by: ["status"], where, _count: true }),
    prisma.lead.count({ where: { followUpAt: { lt: followUpBounds.today } } }),
    prisma.lead.count({ where: { followUpAt: { gte: followUpBounds.today, lt: followUpBounds.tomorrow } } }),
    prisma.lead.count({ where: { followUpAt: { gte: followUpBounds.tomorrow } } })
  ]);

  const eventTypeCounts = countMapFromGroups(eventTypeGroups, "type");
  const totalEvents = sumGroupCounts(eventTypeGroups);
  const productViews = countFor(eventTypeCounts, "product_viewed");
  const campaignViews = countFor(eventTypeCounts, "campaign_viewed");
  const whatsappClicks = countFor(eventTypeCounts, "whatsapp_click");
  const interestAdds = countFor(eventTypeCounts, "interest_item_added");
  const interestSends = countFor(eventTypeCounts, "interest_list_sent");
  const totalLeads = sumGroupCounts(leadsByStatus);
  const newLeads = leadsByStatus.find((item) => item.status === LeadStatus.new)?._count ?? 0;
  const followUps = { overdue: overdueFollowUps, today: todayFollowUps, upcoming: upcomingFollowUps };
  const leadStatusCounts = Object.fromEntries(Object.values(LeadStatus).map((status) => [status, 0])) as Record<LeadStatus, number>;
  for (const item of leadsByStatus) {
    leadStatusCounts[item.status] = item._count;
  }

  return {
    range,
    rangeLabel: analyticsRangeLabels[range],
    overview: {
      totalEvents,
      productViews,
      campaignViews,
      whatsappClicks,
      interestAdds,
      interestSends,
      totalLeads,
      newLeads,
      activeCampaigns,
      publishedProducts
    },
    followUps,
    leadStatusCounts,
    insights: buildInsights({
      newLeads,
      followUps,
      bestProduct: null,
      bestCampaign: null,
      whatsappClicks,
      totalEvents
    })
  };
}

export async function getTopProductsAnalytics(rangeInput: AnalyticsRange = "7d") {
  const range = safeRange(rangeInput);
  const where = dateWhere(range);
  const [productViewGroups, productClickGroups, productInterestGroups] = await Promise.all([
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "product_viewed", entityType: "product" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "whatsapp_click", entityType: "product" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "interest_item_added", entityType: "product" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 })
  ]);
  const productViewMap = new Map<string, number>();
  const productClickMap = new Map<string, number>();
  const productInterestMap = new Map<string, number>();
  for (const item of productViewGroups) addCount(productViewMap, item.entityId, item._count);
  for (const item of productClickGroups) addCount(productClickMap, item.entityId, item._count);
  for (const item of productInterestGroups) addCount(productInterestMap, item.entityId, item._count);
  const productSlugs = Array.from(new Set([...productViewMap.keys(), ...productClickMap.keys(), ...productInterestMap.keys()])).slice(0, 40);
  const products = productSlugs.length > 0
    ? await prisma.product.findMany({ where: { slug: { in: productSlugs } }, select: { slug: true, code: true, titleAr: true, status: true } })
    : [];
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  return productSlugs
    .map((slug) => {
      const product = productBySlug.get(slug);
      return {
        slug,
        title: product?.titleAr ?? slug,
        code: product?.code ?? "",
        status: product?.status,
        views: countFor(productViewMap, slug),
        whatsappClicks: countFor(productClickMap, slug),
        interestAdds: countFor(productInterestMap, slug)
      };
    })
    .sort((a, b) => b.views + b.whatsappClicks * 2 + b.interestAdds - (a.views + a.whatsappClicks * 2 + a.interestAdds))
    .slice(0, 10);
}

export async function getTopCampaignsAnalytics(rangeInput: AnalyticsRange = "7d") {
  const range = safeRange(rangeInput);
  const where = dateWhere(range);
  const [campaignViewGroups, campaignClickByEntityGroups, campaignClickByUtmGroups, campaignLeadGroups] = await Promise.all([
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "campaign_viewed", entityType: "campaign" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "whatsapp_click", entityType: "campaign" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["utmCampaign"], where: { ...where, type: "whatsapp_click", utmCampaign: { not: null } }, _count: true, orderBy: { _count: { utmCampaign: "desc" } }, take: 10 }),
    prisma.lead.groupBy({ by: ["campaignSlug"], where: { ...where, campaignSlug: { not: null } }, _count: true, orderBy: { _count: { campaignSlug: "desc" } }, take: 10 })
  ]);
  const campaignViewMap = new Map<string, number>();
  const campaignClickMap = new Map<string, number>();
  const campaignLeadMap = new Map<string, number>();
  for (const item of campaignViewGroups) addCount(campaignViewMap, item.entityId, item._count);
  for (const item of campaignClickByEntityGroups) addCount(campaignClickMap, item.entityId, item._count);
  for (const item of campaignClickByUtmGroups) addCount(campaignClickMap, item.utmCampaign, item._count);
  for (const item of campaignLeadGroups) addCount(campaignLeadMap, item.campaignSlug, item._count);
  const campaignSlugs = Array.from(new Set([...campaignViewMap.keys(), ...campaignClickMap.keys(), ...campaignLeadMap.keys()])).slice(0, 40);
  const campaigns = campaignSlugs.length > 0
    ? await prisma.campaign.findMany({ where: { slug: { in: campaignSlugs } }, select: { slug: true, titleAr: true, status: true } })
    : [];
  const campaignBySlug = new Map(campaigns.map((campaign) => [campaign.slug, campaign]));
  return campaignSlugs
    .map((slug) => {
      const campaign = campaignBySlug.get(slug);
      const views = countFor(campaignViewMap, slug);
      const whatsappClicksForCampaign = countFor(campaignClickMap, slug);
      return {
        slug,
        title: campaign?.titleAr ?? slug,
        status: campaign?.status,
        views,
        whatsappClicks: whatsappClicksForCampaign,
        leads: countFor(campaignLeadMap, slug),
        conversionRate: conversionRate(whatsappClicksForCampaign, views)
      };
    })
    .sort((a, b) => b.views + b.whatsappClicks * 2 + b.leads * 3 - (a.views + a.whatsappClicks * 2 + a.leads * 3))
    .slice(0, 10);
}

export async function getTrafficSourcesAnalytics(rangeInput: AnalyticsRange = "7d") {
  const where = dateWhere(safeRange(rangeInput));
  const trafficSourceGroups = await prisma.event.groupBy({ by: ["utmSource", "utmMedium"], where, _count: true, orderBy: { _count: { utmSource: "desc" } }, take: 12 });
  return trafficSourceGroups.map((item) => ({
    source: item.utmSource ?? "direct",
    medium: item.utmMedium ?? "unknown",
    count: item._count
  }));
}

export async function getRecentActivityAnalytics(rangeInput: AnalyticsRange = "7d") {
  const where = dateWhere(safeRange(rangeInput));
  return prisma.event.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, type: true, entityType: true, entityId: true, path: true, utmSource: true, utmMedium: true, utmCampaign: true, createdAt: true }
  }).then((events) => events.map((event) => ({ ...event, label: getEventLabel(event.type) })));
}

export async function getOwnerDashboardSummary() {
  const where = dateWhere("7d");
  const followUpBounds = followUpDateBounds();
  const [
    totalEvents,
    whatsappClicks,
    newLeads,
    activeCampaigns,
    publishedProducts,
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
    recentLeads,
    recentEvents,
    productViewGroups,
    campaignViewGroups
  ] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.count({ where: { ...where, type: "whatsapp_click" } }),
    prisma.lead.count({ where: { ...where, status: LeadStatus.new } }),
    prisma.campaign.count({ where: { status: PublishStatus.published } }),
    prisma.product.count({ where: { status: PublishStatus.published } }),
    prisma.lead.count({ where: { followUpAt: { lt: followUpBounds.today } } }),
    prisma.lead.count({ where: { followUpAt: { gte: followUpBounds.today, lt: followUpBounds.tomorrow } } }),
    prisma.lead.count({ where: { followUpAt: { gte: followUpBounds.tomorrow } } }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, status: true, deliveryArea: true, manualName: true, name: true, utmCampaign: true, sourcePageUrl: true, createdAt: true }
    }),
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, type: true, entityType: true, entityId: true, path: true, utmSource: true, utmMedium: true, utmCampaign: true, createdAt: true }
    }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "product_viewed", entityType: "product" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 5 }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "campaign_viewed", entityType: "campaign" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 5 })
  ]);

  const followUps = { overdue: overdueFollowUps, today: todayFollowUps, upcoming: upcomingFollowUps };

  const productSlugs = productViewGroups.map((item) => item.entityId).filter((slug): slug is string => Boolean(slug));
  const campaignSlugs = campaignViewGroups.map((item) => item.entityId).filter((slug): slug is string => Boolean(slug));
  const [products, campaigns] = await Promise.all([
    productSlugs.length > 0 ? prisma.product.findMany({ where: { slug: { in: productSlugs } }, select: { slug: true, code: true, titleAr: true } }) : Promise.resolve([]),
    campaignSlugs.length > 0 ? prisma.campaign.findMany({ where: { slug: { in: campaignSlugs } }, select: { slug: true, titleAr: true } }) : Promise.resolve([])
  ]);
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const campaignBySlug = new Map(campaigns.map((campaign) => [campaign.slug, campaign]));

  const topProducts = productViewGroups.map((item) => {
    const slug = item.entityId ?? "unknown";
    const product = productBySlug.get(slug);
    return {
      slug,
      title: product?.titleAr ?? slug,
      code: product?.code ?? "",
      views: item._count,
      whatsappClicks: 0,
      interestAdds: 0
    };
  });

  const topCampaigns = campaignViewGroups.map((item) => {
    const slug = item.entityId ?? "unknown";
    const campaign = campaignBySlug.get(slug);
    return {
      slug,
      title: campaign?.titleAr ?? slug,
      views: item._count,
      whatsappClicks: 0,
      leads: 0,
      conversionRate: 0
    };
  });

  const bestProduct = topProducts[0];
  const bestCampaign = topCampaigns[0];

  return {
    overview: {
      totalEvents,
      whatsappClicks,
      newLeads,
      activeCampaigns,
      publishedProducts
    },
    followUps,
    recentLeads,
    recentEvents: recentEvents.map((event) => ({ ...event, label: getEventLabel(event.type) })),
    topProducts,
    topCampaigns,
    insights: buildInsights({
      newLeads,
      followUps,
      bestProduct: bestProduct ? { title: bestProduct.title, views: bestProduct.views } : null,
      bestCampaign: bestCampaign ? { title: bestCampaign.title, score: bestCampaign.views } : null,
      whatsappClicks,
      totalEvents
    })
  };
}

export async function getOwnerAnalytics(rangeInput: AnalyticsRange = "7d") {
  const range = safeRange(rangeInput);
  const where = dateWhere(range);
  const followUpBounds = followUpDateBounds();

  const [
    eventTypeGroups,
    activeCampaigns,
    publishedProducts,
    leadsByStatus,
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
    recentLeads,
    recentEvents,
    productViewGroups,
    productClickGroups,
    productInterestGroups,
    campaignViewGroups,
    campaignClickByEntityGroups,
    campaignClickByUtmGroups,
    campaignLeadGroups,
    trafficSourceGroups
  ] = await Promise.all([
    prisma.event.groupBy({ by: ["type"], where, _count: true }),
    prisma.campaign.count({ where: { status: PublishStatus.published } }),
    prisma.product.count({ where: { status: PublishStatus.published } }),
    prisma.lead.groupBy({ by: ["status"], where, _count: true }),
    prisma.lead.count({ where: { followUpAt: { lt: followUpBounds.today } } }),
    prisma.lead.count({ where: { followUpAt: { gte: followUpBounds.today, lt: followUpBounds.tomorrow } } }),
    prisma.lead.count({ where: { followUpAt: { gte: followUpBounds.tomorrow } } }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, status: true, deliveryArea: true, manualName: true, name: true, utmCampaign: true, sourcePageUrl: true, createdAt: true }
    }),
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, type: true, entityType: true, entityId: true, path: true, utmSource: true, utmMedium: true, utmCampaign: true, createdAt: true }
    }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "product_viewed", entityType: "product" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "whatsapp_click", entityType: "product" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "interest_item_added", entityType: "product" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "campaign_viewed", entityType: "campaign" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "whatsapp_click", entityType: "campaign" }, _count: true, orderBy: { _count: { entityId: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["utmCampaign"], where: { ...where, type: "whatsapp_click", utmCampaign: { not: null } }, _count: true, orderBy: { _count: { utmCampaign: "desc" } }, take: 10 }),
    prisma.lead.groupBy({ by: ["campaignSlug"], where: { ...where, campaignSlug: { not: null } }, _count: true, orderBy: { _count: { campaignSlug: "desc" } }, take: 10 }),
    prisma.event.groupBy({ by: ["utmSource", "utmMedium"], where, _count: true, orderBy: { _count: { utmSource: "desc" } }, take: 12 })
  ]);

  const eventTypeCounts = countMapFromGroups(eventTypeGroups, "type");
  const totalEvents = sumGroupCounts(eventTypeGroups);
  const productViews = countFor(eventTypeCounts, "product_viewed");
  const campaignViews = countFor(eventTypeCounts, "campaign_viewed");
  const whatsappClicks = countFor(eventTypeCounts, "whatsapp_click");
  const interestAdds = countFor(eventTypeCounts, "interest_item_added");
  const interestSends = countFor(eventTypeCounts, "interest_list_sent");
  const totalLeads = sumGroupCounts(leadsByStatus);
  const newLeads = leadsByStatus.find((item) => item.status === LeadStatus.new)?._count ?? 0;

  const productViewMap = new Map<string, number>();
  const productClickMap = new Map<string, number>();
  const productInterestMap = new Map<string, number>();
  for (const item of productViewGroups) addCount(productViewMap, item.entityId, item._count);
  for (const item of productClickGroups) addCount(productClickMap, item.entityId, item._count);
  for (const item of productInterestGroups) addCount(productInterestMap, item.entityId, item._count);

  const campaignViewMap = new Map<string, number>();
  const campaignClickMap = new Map<string, number>();
  const campaignLeadMap = new Map<string, number>();
  for (const item of campaignViewGroups) addCount(campaignViewMap, item.entityId, item._count);
  for (const item of campaignClickByEntityGroups) addCount(campaignClickMap, item.entityId, item._count);
  for (const item of campaignClickByUtmGroups) addCount(campaignClickMap, item.utmCampaign, item._count);
  for (const item of campaignLeadGroups) addCount(campaignLeadMap, item.campaignSlug, item._count);

  const productSlugs = Array.from(new Set([...productViewMap.keys(), ...productClickMap.keys(), ...productInterestMap.keys()])).slice(0, 40);
  const campaignSlugs = Array.from(new Set([...campaignViewMap.keys(), ...campaignClickMap.keys(), ...campaignLeadMap.keys()])).slice(0, 40);
  const [products, campaigns] = await Promise.all([
    productSlugs.length > 0
      ? prisma.product.findMany({ where: { slug: { in: productSlugs } }, select: { slug: true, code: true, titleAr: true, status: true } })
      : Promise.resolve([]),
    campaignSlugs.length > 0
      ? prisma.campaign.findMany({ where: { slug: { in: campaignSlugs } }, select: { slug: true, titleAr: true, status: true } })
      : Promise.resolve([])
  ]);
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const campaignBySlug = new Map(campaigns.map((campaign) => [campaign.slug, campaign]));

  const topProducts = productSlugs
    .map((slug) => {
      const product = productBySlug.get(slug);
      return {
        slug,
        title: product?.titleAr ?? slug,
        code: product?.code ?? "",
        status: product?.status,
        views: countFor(productViewMap, slug),
        whatsappClicks: countFor(productClickMap, slug),
        interestAdds: countFor(productInterestMap, slug)
      };
    })
    .sort((a, b) => b.views + b.whatsappClicks * 2 + b.interestAdds - (a.views + a.whatsappClicks * 2 + a.interestAdds))
    .slice(0, 10);

  const topCampaigns = campaignSlugs
    .map((slug) => {
      const campaign = campaignBySlug.get(slug);
      const views = countFor(campaignViewMap, slug);
      const whatsappClicksForCampaign = countFor(campaignClickMap, slug);
      return {
        slug,
        title: campaign?.titleAr ?? slug,
        status: campaign?.status,
        views,
        whatsappClicks: whatsappClicksForCampaign,
        leads: countFor(campaignLeadMap, slug),
        conversionRate: conversionRate(whatsappClicksForCampaign, views)
      };
    })
    .sort((a, b) => b.views + b.whatsappClicks * 2 + b.leads * 3 - (a.views + a.whatsappClicks * 2 + a.leads * 3))
    .slice(0, 10);

  const trafficSources = trafficSourceGroups.map((item) => ({
    source: item.utmSource ?? "direct",
    medium: item.utmMedium ?? "unknown",
    count: item._count
  }));

  const followUps = { overdue: overdueFollowUps, today: todayFollowUps, upcoming: upcomingFollowUps };

  const leadStatusCounts = Object.fromEntries(Object.values(LeadStatus).map((status) => [status, 0])) as Record<LeadStatus, number>;
  for (const item of leadsByStatus) {
    leadStatusCounts[item.status] = item._count;
  }

  const bestProduct = topProducts[0];
  const bestCampaign = topCampaigns[0];

  return {
    range,
    rangeLabel: analyticsRangeLabels[range],
    overview: {
      totalEvents,
      productViews,
      campaignViews,
      whatsappClicks,
      interestAdds,
      interestSends,
      totalLeads,
      newLeads,
      activeCampaigns,
      publishedProducts
    },
    followUps,
    leadStatusCounts,
    recentLeads,
    recentEvents: recentEvents.map((event) => ({ ...event, label: getEventLabel(event.type) })),
    topProducts,
    topCampaigns,
    trafficSources,
    insights: buildInsights({
      newLeads,
      followUps,
      bestProduct: bestProduct ? { title: bestProduct.title, views: bestProduct.views } : null,
      bestCampaign: bestCampaign ? { title: bestCampaign.title, score: bestCampaign.views + bestCampaign.whatsappClicks + bestCampaign.leads } : null,
      whatsappClicks,
      totalEvents
    })
  };
}

export async function getProductPerformanceMetrics(slugs: string[], rangeInput: AnalyticsRange = "30d") {
  const productSlugs = uniqueNonEmpty(slugs).slice(0, 200);
  if (productSlugs.length === 0) return new Map<string, { views: number; whatsappClicks: number; interestAdds: number }>();
  const where = dateWhere(safeRange(rangeInput));
  const entityFilter = { in: productSlugs };
  const [viewGroups, clickGroups, interestGroups] = await Promise.all([
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "product_viewed", entityType: "product", entityId: entityFilter }, _count: true }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "whatsapp_click", entityType: "product", entityId: entityFilter }, _count: true }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "interest_item_added", entityType: "product", entityId: entityFilter }, _count: true })
  ]);
  const metrics = new Map<string, { views: number; whatsappClicks: number; interestAdds: number }>();
  for (const slug of productSlugs) metrics.set(slug, { views: 0, whatsappClicks: 0, interestAdds: 0 });
  for (const item of viewGroups) {
    if (item.entityId && metrics.has(item.entityId)) metrics.get(item.entityId)!.views += item._count;
  }
  for (const item of clickGroups) {
    if (item.entityId && metrics.has(item.entityId)) metrics.get(item.entityId)!.whatsappClicks += item._count;
  }
  for (const item of interestGroups) {
    if (item.entityId && metrics.has(item.entityId)) metrics.get(item.entityId)!.interestAdds += item._count;
  }
  return metrics;
}

export async function getCampaignPerformanceMetrics(slugs: string[], rangeInput: AnalyticsRange = "30d") {
  const campaignSlugs = uniqueNonEmpty(slugs).slice(0, 200);
  if (campaignSlugs.length === 0) return new Map<string, { views: number; whatsappClicks: number; leads: number; conversionRate: number }>();
  const where = dateWhere(safeRange(rangeInput));
  const entityFilter = { in: campaignSlugs };
  const [viewGroups, clickEntityGroups, clickUtmGroups, leadGroups] = await Promise.all([
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "campaign_viewed", entityType: "campaign", entityId: entityFilter }, _count: true }),
    prisma.event.groupBy({ by: ["entityId"], where: { ...where, type: "whatsapp_click", entityType: "campaign", entityId: entityFilter }, _count: true }),
    prisma.event.groupBy({ by: ["utmCampaign"], where: { ...where, type: "whatsapp_click", utmCampaign: entityFilter }, _count: true }),
    prisma.lead.groupBy({ by: ["campaignSlug"], where: { ...where, campaignSlug: entityFilter }, _count: true })
  ]);
  const metrics = new Map<string, { views: number; whatsappClicks: number; leads: number; conversionRate: number }>();
  for (const slug of campaignSlugs) metrics.set(slug, { views: 0, whatsappClicks: 0, leads: 0, conversionRate: 0 });
  for (const item of viewGroups) {
    if (item.entityId && metrics.has(item.entityId)) metrics.get(item.entityId)!.views += item._count;
  }
  for (const item of clickEntityGroups) {
    if (item.entityId && metrics.has(item.entityId)) metrics.get(item.entityId)!.whatsappClicks += item._count;
  }
  for (const item of clickUtmGroups) {
    if (item.utmCampaign && metrics.has(item.utmCampaign)) metrics.get(item.utmCampaign)!.whatsappClicks += item._count;
  }
  for (const item of leadGroups) {
    if (item.campaignSlug && metrics.has(item.campaignSlug)) metrics.get(item.campaignSlug)!.leads += item._count;
  }
  for (const metric of metrics.values()) metric.conversionRate = conversionRate(metric.whatsappClicks, metric.views);
  return metrics;
}

function countMapFromGroups<T extends Record<K, string | null> & { _count: number }, K extends keyof T>(groups: T[], key: K) {
  const map = new Map<string, number>();
  for (const item of groups) addCount(map, item[key], item._count);
  return map;
}

function sumGroupCounts(groups: { _count: number }[]) {
  return groups.reduce((total, item) => total + item._count, 0);
}

function uniqueNonEmpty(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildInsights(input: {
  newLeads: number;
  followUps: { overdue: number; today: number; upcoming: number };
  bestProduct: { title: string; views: number } | null;
  bestCampaign: { title: string; score: number } | null;
  whatsappClicks: number;
  totalEvents: number;
}) {
  const insights: string[] = [];
  if (input.followUps.overdue > 0) insights.push(`لديك ${input.followUps.overdue} عميل متأخر يحتاج متابعة.`);
  if (input.followUps.today > 0) insights.push(`هناك ${input.followUps.today} متابعة مجدولة اليوم.`);
  if (input.newLeads > 0) insights.push(`وصل ${input.newLeads} عميل جديد ضمن الفترة المختارة.`);
  if (input.bestProduct && input.bestProduct.views > 0) insights.push(`أكثر تصميم جذب مشاهدة هو: ${input.bestProduct.title}.`);
  if (input.bestCampaign && input.bestCampaign.score > 0) insights.push(`الحملة الأعلى تفاعلًا حاليًا: ${input.bestCampaign.title}.`);
  if (input.whatsappClicks === 0) insights.push("لم يتم تسجيل ضغطات واتساب ضمن الفترة المختارة بعد.");
  if (input.totalEvents === 0) insights.push("ستظهر البيانات هنا بعد أن يبدأ الزوار بالتفاعل مع الموقع.");
  return insights.slice(0, 5);
}
