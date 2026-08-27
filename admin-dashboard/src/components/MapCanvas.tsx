import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { LatLng } from '../lib/types'
import { IRAQ_CENTER, fitIraq, flyToIraqPlace } from '../lib/geo'

/* ============================================================
   Zajel Admin — أداة رسم الحدود الجغرافية (Geofencing) على خريطة حقيقية
   Leaflet + OpenStreetMap (بدون مفاتيح API). تدعم:
   - العرض الافتراضي: العراق كاملاً (كل المحافظات)
   - الانتقال التلقائي لأي محافظة عبر بحث جغرافي حقيقي (Nominatim/OSM)
   - رسم مضلع بالنقر على الخريطة
   - التراجع عن آخر نقطة، إغلاق المضلع، والمسح
   - عرض مضلعات المناطق الأخرى كطبقة خلفية (Read-only)
   التصميم أبيض/أسود متوافق مع هوية لوحة الإدارة.
   ============================================================ */

export default function MapCanvas({
  points = [],
  onChange,
  zones = [],
  tools = true,
  height = 384,
  governorate = null,
  hint = 'اختر المحافظة ثم انقر على الخريطة لتحديد نقاط حدود المنطقة، وأغلق المضلع بزر الإغلاق أو بالنقر قرب النقطة الأولى.',
}: {
  points?: LatLng[]
  onChange?: (p: LatLng[]) => void
  zones?: LatLng[][]
  tools?: boolean
  height?: number
  /** اسم المحافظة المختارة (من بيانات النظام) — تنتقل الخريطة إليها عبر بحث جغرافي حقيقي */
  governorate?: string | null
  hint?: string
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const drawLayerRef = useRef<L.LayerGroup | null>(null)
  const zonesLayerRef = useRef<L.LayerGroup | null>(null)

  // نسخ حية للقيم حتى يقرأها معالج النقر بدون إعادة إنشاء الخريطة
  const pointsRef = useRef(points)
  const onChangeRef = useRef(onChange)
  const toolsRef = useRef(tools)
  const modeRef = useRef<'draw' | 'idle'>('draw')
  const closedRef = useRef(points.length > 2)
  const govRef = useRef(!!governorate)

  const [mode, setMode] = useState<'draw' | 'idle'>('draw')
  const [closed, setClosed] = useState(points.length > 2)
  const [govStatus, setGovStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  useEffect(() => {
    pointsRef.current = points
    onChangeRef.current = onChange
    toolsRef.current = tools
    modeRef.current = mode
    closedRef.current = closed
    govRef.current = !!governorate
  }, [points, onChange, tools, mode, closed, governorate])

  /* ---------- تهيئة الخريطة مرة واحدة (تبدأ من العراق كاملاً) ---------- */
  useEffect(() => {
    if (!divRef.current || mapRef.current) return
    const map = L.map(divRef.current, {
      center: [IRAQ_CENTER.lat, IRAQ_CENTER.lng],
      zoom: 6,
      minZoom: 4,
      maxZoom: 19,
      scrollWheelZoom: true,
      dragging: true,
      zoomControl: true,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    zonesLayerRef.current = L.layerGroup().addTo(map)
    drawLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    // إضافة نقطة عند النقر في وضع الرسم
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!toolsRef.current || modeRef.current !== 'draw' || closedRef.current) return
      // لا يبدأ الرسم إلا بعد اختيار المحافظة (تحددها الإدارة بنفسها)
      if (!govRef.current) return
      const pos: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng }
      const current = pointsRef.current

      // إغلاق المضلع عند النقر قرب النقطة الأولى
      if (current.length >= 3) {
        const first = current[0]
        const dist = Math.hypot(pos.lat - first.lat, pos.lng - first.lng)
        if (dist < 0.0008) {
          setClosed(true)
          setMode('idle')
          return
        }
      }
      onChangeRef.current?.([...current, pos])
    })

    return () => {
      map.remove()
      mapRef.current = null
      zonesLayerRef.current = null
      drawLayerRef.current = null
    }
  }, [])

  /* ---------- العرض الافتتاحي: المضلع المحفوظ، أو المحافظة، أو العراق كاملاً ---------- */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (closedRef.current && pointsRef.current.length > 2) {
      map.fitBounds(
        L.latLngBounds(pointsRef.current.map((p) => [p.lat, p.lng] as [number, number])).pad(0.3),
      )
    } else if (governorate) {
      setGovStatus('loading')
      flyToIraqPlace(map, governorate).then((ok) => setGovStatus(ok ? 'done' : 'error'))
    } else {
      fitIraq(map)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- الانتقال التلقائي للمحافظة المختارة (بحث جغرافي حقيقي) ---------- */
  const prevGovRef = useRef<string | null>(governorate)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const prev = prevGovRef.current
    prevGovRef.current = governorate

    // إلغاء الاختيار → العودة لعرض العراق كاملاً
    if (!governorate) {
      if (prev) fitIraq(map)
      return
    }
    if (prev === governorate) return
    let cancelled = false
    setGovStatus('loading')
    flyToIraqPlace(map, governorate).then((ok) => {
      if (!cancelled) setGovStatus(ok ? 'done' : 'error')
    })
    return () => {
      cancelled = true
    }
  }, [governorate])

  /* ---------- رسم المضلع القابل للتعديل ---------- */
  useEffect(() => {
    const layer = drawLayerRef.current
    if (!layer) return
    layer.clearLayers()
    if (!points.length) return

    const latlngs = points.map((p) => [p.lat, p.lng] as [number, number])

    if (points.length === 1) {
      L.circleMarker(latlngs[0], {
        radius: 6,
        color: '#000',
        weight: 1.5,
        fillColor: '#fff',
        fillOpacity: 1,
      }).addTo(layer)
      return
    }

    if (closedRef.current && points.length > 2) {
      L.polygon(latlngs, {
        color: '#000',
        weight: 2,
        dashArray: '5 4',
        fillColor: '#000',
        fillOpacity: 0.1,
      }).addTo(layer)
    } else {
      L.polyline(latlngs, {
        color: '#000',
        weight: 2,
        dashArray: '5 4',
      }).addTo(layer)
    }

    points.forEach((p, i) => {
      L.circleMarker([p.lat, p.lng], {
        radius: i === 0 ? 6 : 5,
        color: '#000',
        weight: 1.5,
        fillColor: i === 0 ? '#000' : '#fff',
        fillOpacity: 1,
      })
        .bindTooltip(`نقطة ${i + 1}`, { direction: 'top', offset: [0, -8] })
        .addTo(layer)
    })
  }, [points, closed])

  /* ---------- عرض مضلعات المناطق الأخرى ---------- */
  useEffect(() => {
    const layer = zonesLayerRef.current
    if (!layer) return
    layer.clearLayers()
    zones.forEach((ring) => {
      if (!ring || ring.length <= 2) return
      L.polygon(
        ring.map((p) => [p.lat, p.lng] as [number, number]),
        {
          color: '#999',
          weight: 1.5,
          dashArray: '3 5',
          fillColor: '#999',
          fillOpacity: 0.06,
        },
      ).addTo(layer)
    })
  }, [zones])

  /* ---------- ضبط مدى الرؤية على المضلع المرسوم عند الإغلاق ---------- */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !closedRef.current || points.length < 2) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds.pad(0.3))
  }, [points, closed])

  const empty = points.length === 0 && zones.filter((z) => z.length > 2).length === 0
  const showHint = empty || (tools && !governorate && points.length === 0)

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      {tools && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white p-3">
          <button
            type="button"
            className={`btn-ghost ${mode === 'draw' && !closed ? 'border-black' : ''}`}
            onClick={() => {
              setMode('draw')
              setClosed(false)
            }}
          >
            ✏️ رسم مضلع
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={points.length === 0}
            onClick={() => onChangeRef.current?.(pointsRef.current.slice(0, -1))}
          >
            ↩️ تراجع
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={points.length < 3 || closed}
            onClick={() => {
              setClosed(true)
              setMode('idle')
            }}
          >
            ⭕ إغلاق المضلع
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={points.length === 0}
            onClick={() => {
              onChangeRef.current?.([])
              setClosed(false)
              setMode('draw')
            }}
          >
            🗑️ مسح
          </button>
          <span className="mr-auto flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-faint">
            {governorate ? (
              <>
                <span>📍 {governorate}</span>
                {govStatus === 'loading' && <span>· جاري تحديد الموقع…</span>}
                {govStatus === 'error' && <span>· ⚠️ تعذر التحديد تلقائياً — حرّك الخريطة يدوياً</span>}
              </>
            ) : (
              <span>🗺️ العراق كامل · اختر المحافظة لبدء الرسم</span>
            )}
            <span>
              {points.length} نقطة {closed ? '· المضلع مغلق ✅' : '· ارسم بالترتيب حول حدود المنطقة'}
            </span>
          </span>
        </div>
      )}

      <div className="relative" style={{ height }}>
        <div ref={divRef} className="zajel-map" style={{ height: '100%', width: '100%' }} />
        {showHint && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-page/60">
            <p className="max-w-md rounded-xl border border-line bg-white/95 px-4 py-3 text-center text-xs font-semibold text-mute shadow">
              🗺️ {hint}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
