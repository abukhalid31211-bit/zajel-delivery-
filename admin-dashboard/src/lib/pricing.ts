/* ============================================================
   طبقة التخصيص السعري — تسعير توصيل مخصص لكل محل
   دوال نقية تُقرأ من نفس مخزن اللوحة (zajel_storePricing)
   جاهزة للربط المباشر مع أي Back-end عبر REST/GraphQL.
   ============================================================ */
import { dbGet } from './db'
import { getSettings } from './settings'
import type { GeoPrice, PriceRoute, StoreItem, StorePriceOverride } from './types'

/** مفتاح التخزين لقائمة التخصيصات */
export const OVERRIDES_KEY = 'storePricing'

export function getOverrides(): StorePriceOverride[] {
  return dbGet<StorePriceOverride[]>(OVERRIDES_KEY, [])
}

/** التخصيص النشط لمحل معيّن (أو null إن كان المحل على السعر العام) */
export function overrideFor(storeId: string, list = getOverrides()): StorePriceOverride | null {
  if (!storeId) return null
  const hit = list.find((r) => r.storeId === storeId)
  if (!hit) return null
  // المحل الموقوف أو غير الموافَق عليه لا يستفيد من تخصيصه
  const store = dbGet<StoreItem[]>('stores', []).find((s) => s.id === storeId)
  if (store && store.status !== 'نشط') return null
  return hit
}

/**
 * السعر الذي سيدفعه الزبون لهذا المحل:
 * التخصيص إن وُجد، وإلا السعر العام المحسوب من نظام التسعير النشط.
 */
export function feeForStore(store: StoreItem | undefined, routes: PriceRoute[], geoPrices: GeoPrice[]): { fee: string | null; source: string } {
  if (!store) return { fee: null, source: '—' }
  const custom = overrideFor(store.id)
  if (custom) return { fee: custom.fee, source: 'تخصيص' }
  const info = publicPriceFor(store, routes, geoPrices)
  return { fee: info.price, source: info.source }
}

export type PublicPriceInfo = { price: string | null; source: string; label: string }

/** السعر العام المتاح لمحل حسب منطقته — من المسارات أو من المناطق الجغرافية */
export function publicPriceFor(store: StoreItem, routes: PriceRoute[], geoPrices: GeoPrice[]): PublicPriceInfo {
  const mode = getSettings().pricingMode
  if (mode === 'geo') {
    const geo = geoPrices.find((g) => g.districtId === store.districtId)
    if (!geo) return { price: null, source: 'غير محدد', label: 'لم تُربط منطقة المحل بسعر جغرافي' }
    return {
      price: geo.base,
      source: 'مناطق جغرافية',
      label: `${geo.base} د.ع + ${geo.perKm} د.ع لكل كم`,
    }
  }
  const districtRoutes = routes.filter((r) => r.fromId === store.districtId || r.toId === store.districtId)
  if (!districtRoutes.length) return { price: null, source: 'غير محدد', label: 'لا توجد مسارات سعرية لمنطقة المحل' }
  const nums = districtRoutes.map((r) => Number(r.price)).filter((n) => Number.isFinite(n))
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return {
    price: String(min),
    source: 'مسارات منطقة المحل',
    label:
      min === max
        ? `${min} د.ع — من مسار واحد يمسّ منطقة المحل`
        : `أقل سعر ${min} د.ع / أعلى ${max} د.ع — عبر ${districtRoutes.length} مسارات تمسّ منطقة المحل`,
  }
}

/** الفرق بين السعر العام والسعر المخصص بصيغة نصية عربية */
export function diffLabel(customFee: string, publicFee: string | null): { text: string; tone: 'down' | 'up' | 'equal' | 'none' } {
  const c = Number(customFee)
  const p = publicFee === null ? null : Number(publicFee)
  if (p === null || !Number.isFinite(p)) return { text: 'لا يوجد سعر عام للمقارنة', tone: 'none' }
  const d = c - p
  if (d === 0) return { text: 'مطابق للسعر العام', tone: 'equal' }
  if (d < 0) return { text: `أقل من العام بـ ${Math.abs(d)} د.ع`, tone: 'down' }
  return { text: `أعلى من العام بـ ${d} د.ع`, tone: 'up' }
}
