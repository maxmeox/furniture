#!/usr/bin/env npx tsx
// scripts/validate-tenant.ts
// يتحقق من اكتمال tenant.config.ts قبل البناء

import config from '../tenant.config'

const errors:   string[] = []
const warnings: string[] = []

const required: Array<{ path: string; value: unknown }> = [
  { path: 'identity.nameAr',        value: config.identity.nameAr        },
  { path: 'identity.nameEn',        value: config.identity.nameEn        },
  { path: 'identity.shortNameAr',   value: config.identity.shortNameAr   },
  { path: 'identity.city',          value: config.identity.city          },
  { path: 'identity.heroTitleAr',   value: config.identity.heroTitleAr   },
  { path: 'contact.whatsappNumber', value: config.contact.whatsappNumber },
  { path: 'branding.defaultTheme',  value: config.branding.defaultTheme  },
  { path: 'seo.titleAr',            value: config.seo.titleAr            },
  { path: 'seo.descriptionAr',      value: config.seo.descriptionAr      },
  { path: 'locales.default',        value: config.locales.default        },
  { path: 'admin.email',            value: config.admin.email            },
  { path: 'admin.formBackupKey',    value: config.admin.formBackupKey    },
]

const PLACEHOLDERS = [
  'اسم المعرض هنا', 'YOUR_SHOWROOM', '970XXXXXXXXX',
  'name@showroom', 'placeholder', 'TODO', 'FIXME',
  'example.com', 'LOGO HERE',
]

const VALID_THEMES = ['default', 'luxury-classic', 'dark-mode', 'modern-minimal'] as const

for (const { path, value } of required) {
  if (!value || String(value).trim() === '') {
    errors.push(`❌ حقل إلزامي فارغ: ${path}`)
    continue
  }
  if (PLACEHOLDERS.some(p => String(value).includes(p))) {
    errors.push(`❌ placeholder لم يُستبدل: ${path}`)
  }
}

if (!(VALID_THEMES as readonly string[]).includes(config.branding.defaultTheme))
  errors.push(`❌ سمة غير معروفة: "${config.branding.defaultTheme}"`)

if (!/^\d{10,15}$/.test(config.contact.whatsappNumber))
  errors.push(`❌ رقم واتساب غير صحيح — أرقام فقط، 10-15 رقم`)

if (!config.locales.supported.includes(config.locales.default))
  errors.push(`❌ اللغة الافتراضية "${config.locales.default}" غير موجودة في supported`)

if (config.deliveryAreas.length === 0)
  warnings.push('⚠️  لا مناطق توصيل — أضف واحدة على الأقل')

if (!config.social.facebook && !config.social.instagram)
  warnings.push('⚠️  لا حسابات تواصل اجتماعي')

if (!config.branding.ogImage || config.branding.ogImage.includes('placeholder'))
  warnings.push('⚠️  og-image مفقود — يؤثر على مشاركة واتساب/فيسبوك')

console.log('\n══════════════════════════════════════════')
console.log('  Tenant Config Validation')
console.log(`  ${config.identity.nameAr} | ${config.identity.city}`)
console.log('══════════════════════════════════════════\n')

if (warnings.length)
  warnings.forEach(w => console.log(` ${w}`))

if (errors.length) {
  errors.forEach(e => console.log(` ${e}`))
  console.log('\n✗ فشل — أصلح الأخطاء في tenant.config.ts\n')
  process.exit(1)
}

console.log(' ✓ tenant.config.ts صحيح وجاهز')
console.log(` ✓ اللغات: ${config.locales.supported.join(', ')}`)
console.log(` ✓ السمة: ${config.branding.defaultTheme}`)
console.log(` ✓ مناطق التوصيل: ${config.deliveryAreas.length}\n`)
