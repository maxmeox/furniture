import nodemailer from "nodemailer";
import type { InquiryPayload } from "./conversion";
import { tenant } from "@/lib/tenant";

const smtpHost = process.env.SMTP_HOST ?? "";
const smtpPort = parseInt(process.env.SMTP_PORT ?? "587", 10);
const smtpUser = process.env.SMTP_USER ?? "";
const smtpPass = process.env.SMTP_PASS ?? "";
const notifyEmail = process.env.NOTIFICATION_EMAIL ?? "";

function isConfigured(): boolean {
  return !!(smtpHost && smtpUser && smtpPass && notifyEmail);
}

function getTransporter() {
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

function leadEmailHtml(payload: InquiryPayload): string {
  const inquiryLabels: Record<string, string> = {
    ask_for_price: "طلب سعر",
    customization: "تفصيل حسب الطلب",
    general: "استفسار عام",
    delivery: "استفسار توصيل",
  };
  const deliveryArea = payload.deliveryArea ?? "غير محدد";
  const inquiryType = inquiryLabels[payload.inquiryType] ?? payload.inquiryType;
  const productInfo = payload.entity.type === "product" ? `<p><strong>المنتج:</strong> ${payload.entity.title}</p>` : "";
  const fabricInfo = payload.selectedFabric ? `<p><strong>القماش:</strong> ${payload.selectedFabric}</p>` : "";
  const noteInfo = payload.note ? `<p><strong>ملاحظة:</strong> ${payload.note}</p>` : "";
  const campaignInfo = payload.campaignContext?.utm_campaign ? `<p><strong>الحملة:</strong> ${payload.campaignContext.utm_campaign}</p>` : "";

  return `
    <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6f4f2f;">🔔 استفسار جديد من الموقع</h2>
      <hr style="border: 1px solid #ded0bd;" />
      ${productInfo}
      ${fabricInfo}
      <p><strong>نوع الطلب:</strong> ${inquiryType}</p>
      <p><strong>منطقة التوصيل:</strong> ${deliveryArea}</p>
      ${noteInfo}
      ${campaignInfo}
      <p><strong>الصفحة:</strong> ${payload.sourcePageUrl ?? "غير معروف"}</p>
      <hr style="border: 1px solid #ded0bd;" />
      <p style="color: #746455; font-size: 12px;">
        هذه رسالة آلية من موقع ${tenant.identity.nameAr}.<br />
        للرد على الاستفسار، افتح واتساب وتواصل مع العميل.
      </p>
    </div>
  `;
}

export async function notifyNewLead(payload: InquiryPayload) {
  if (!isConfigured()) return;
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${tenant.identity.nameAr}" <${smtpUser}>`,
      to: notifyEmail,
      subject: `🔔 استفسار جديد — ${payload.entity.title || "بدون عنوان"}`,
      html: leadEmailHtml(payload),
    });
  } catch (e) {
    console.error("[notify] Failed to send lead notification email:", e);
  }
}
