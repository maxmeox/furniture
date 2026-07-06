# Brand Assets — المطلوب قبل الإطلاق

ضع الملفات التالية هنا (`public/brand/`) قبل النشر:

| الملف | الأبعاد | الصيغة | الاستخدام |
|-------|---------|--------|-----------|
| logo-light.svg | 140×40px | SVG | الشعار على خلفية فاتحة |
| logo-dark.svg | 140×40px | SVG | الشعار على خلفية داكنة |
| favicon.ico | 32×32px | ICO | أيقونة تبويب المتصفح |
| apple-touch-icon.png | 180×180px | PNG | أيقونة iOS عند الحفظ للشاشة الرئيسية |
| og-image.jpg | 1200×630px | JPG | صورة المشاركة على واتساب وفيسبوك |

## ملاحظات مهمة

- SVG مفضّل للشعار (قابل للتكبير بلا فقدان جودة)
- الشعار يجب أن يكون شفافاً (بدون خلفية)
- og-image.jpg يجب ألا يزيد عن 300KB
- الأبعاد مهمة لمنع CLS (Cumulative Layout Shift)
- لا تغيّر width/height في tenant.config إلا إذا غيّرت الملف الفعلي

## بعد وضع الملفات

تأكد من تحديث `tenant.config.ts`:
- `branding.logo.lightUrl` ← `/brand/logo-light.svg`
- `branding.logo.darkUrl` ← `/brand/logo-dark.svg`
- `branding.logo.width` و `height` ← أبعاد الشعار الفعلية
- `branding.favicon`, `appleTouchIcon`, `ogImage` ← مسارات الملفات الصحيحة
