/* ============================================================
   Zajel Store App — مكونات الخريطة الحقيقية (Leaflet + OSM)
   خريطة تفاعلية حقيقية: تحريك، تكبير، تثبيت دبوس، مضلعات مناطق
   التغطية (Geofencing)، وعرض حركة الكابتن. بدون مفاتيح API.
   ============================================================ */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { SERVICE_ZONES, lerp, type LatLng } from './data'

export const DEFAULT_CENTER: LatLng = { lat: 33.3152, lng: 44.3661 } // بغداد

function pin(emoji: string, kind: 'store' | 'dropoff' | 'captain') {
  return L.divIcon({
    className: '',
    html: `<div class="zajel-pin ${kind}"><span>${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 30],
  })
}

export interface MapMarker {
  pos: LatLng
  kind: 'store' | 'dropoff' | 'captain'
  label?: string
}

export function MapView({
  center = DEFAULT_CENTER,
  markers = [],
  zones = [],
  height = 240,
  zoom = 13,
  interactive = false,
  fit = false,
}: {
  center?: LatLng
  markers?: MapMarker[]
  zones?: LatLng[][]
  height?: number
  zoom?: number
  interactive?: boolean
  fit?: boolean
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!divRef.current || mapRef.current) return
    const map = L.map(divRef.current, {
      center: [center.lat, center.lng],
      zoom,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()

    zones.forEach((ring) => {
      if (ring.length > 2) {
        L.polygon(ring, {
          color: '#c9a227',
          weight: 2,
          dashArray: '6 6',
          fillColor: '#c9a227',
          fillOpacity: 0.08,
        }).addTo(layer)
      }
    })

    markers.forEach((m) => {
      const mk = L.marker([m.pos.lat, m.pos.lng], { icon: pin(m.kind === 'store' ? '🏪' : m.kind === 'captain' ? '🛵' : '🏠', m.kind) }).addTo(layer)
      if (m.label) mk.bindTooltip(m.label, { direction: 'top', offset: [0, -24] })
    })

    if (fit && markers.length > 0) {
      const group = L.featureGroup(markers.map((m) => L.marker([m.pos.lat, m.pos.lng])))
      map.fitBounds(group.getBounds().pad(0.35))
    } else if (fit && zones.length > 0) {
      const group = L.featureGroup(zones.map((ring) => L.polygon(ring)))
      map.fitBounds(group.getBounds().pad(0.25))
    }
  }, [markers, zones, fit])

  return <div ref={divRef} className="zajel-map" style={{ height, width: '100%' }} />
}

/** منتقي موقع: خريطة تفاعلية بدبوس في المنتصف + زر إعادة التمركز */
export function LocationPicker({
  value,
  onChange,
  locked = false,
  height = 240,
  zones = [],
  children,
}: {
  value: LatLng
  onChange?: (pos: LatLng) => void
  locked?: boolean
  height?: number
  zones?: LatLng[][]
  children?: React.ReactNode
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value
  const lockedRef = useRef(locked)
  lockedRef.current = locked

  useEffect(() => {
    if (!divRef.current || mapRef.current) return
    const map = L.map(divRef.current, {
      center: [value.lat, value.lng],
      zoom: 13,
      scrollWheelZoom: !lockedRef.current,
      dragging: !lockedRef.current,
      zoomControl: !lockedRef.current,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map)

    zones.forEach((ring) => {
      if (ring.length > 2) {
        L.polygon(ring, { color: '#c9a227', weight: 2, dashArray: '6 6', fillColor: '#c9a227', fillOpacity: 0.08 }).addTo(map)
      }
    })

    map.on('moveend', () => {
      const c = map.getCenter()
      onChange?.({ lat: c.lat, lng: c.lng })
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* مزامنة الحالة المقفلة/المفتوحة */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.dragging[locked ? 'disable' : 'enable']()
    map.scrollWheelZoom[locked ? 'disable' : 'enable']()
  }, [locked])

  const recenter = () => {
    mapRef.current?.setView([valueRef.current.lat, valueRef.current.lng], 14, { animate: true })
  }

  return (
    <div className="relative">
      <div ref={divRef} className="zajel-map" style={{ height, width: '100%' }} />
      {!locked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="zajel-pin store -translate-y-3.5" style={{ transform: 'rotate(-45deg)' }}>
            <span style={{ transform: 'rotate(45deg)' }}>📍</span>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={recenter}
        className="absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-xl border border-gold/40 bg-white/95 px-3 py-2 text-[11px] font-bold text-gold-strong shadow"
      >
        ⌖ إعادة التمركز
      </button>
      {children}
    </div>
  )
}

/** مضلع منطقة التغطية التقريبية حول نقطة (تمثيل Geofencing) */
export function zoneRing(center: LatLng, radiusKm: number, points = 24): LatLng[] {
  const ring: LatLng[] = []
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    const dLat = (radiusKm / 111) * Math.sin(angle)
    const dLng = (radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180))) * Math.cos(angle)
    ring.push({ lat: center.lat + dLat, lng: center.lng + dLng })
  }
  return ring
}

/** موقع الكابتن التقديري على المسار حسب مرحلة الطلب */
export function captainPosFor(store: LatLng, dropoff: LatLng, status: string): LatLng | null {
  switch (status) {
    case 'heading':
      return lerp(store, dropoff, 0.18)
    case 'arrived':
      return lerp(store, dropoff, 0.03)
    case 'picked_up':
      return lerp(store, dropoff, 0.05)
    case 'on_way':
      return lerp(store, dropoff, 0.62)
    case 'delivered':
    case 'completed':
      return dropoff
    default:
      return null
  }
}

export { SERVICE_ZONES }
