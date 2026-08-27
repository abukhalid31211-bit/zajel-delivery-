# زاجل ديلفري — Zajel Delivery (العراق)

منظومة توصيل متكاملة مكونة من **ثلاثة مشاريع منفصلة تماماً**، كل مشروع في مجلده الخاص ويُرفع ويُستضاف بشكل مستقل على Vercel.

| المشروع | المجلد | النوع | منفذ التطوير |
|---|---|---|---|
| 🖥️ لوحة الإدارة | [`admin-dashboard/`](./admin-dashboard) | ويب (Desktop-first RTL) | `5173` |
| 🏍️ تطبيق الكابتن | [`captain-app/`](./captain-app) | تصميم تطبيق موبايل + Splash Screen (10 ثوانٍ) | `5174` |
| 🏪 تطبيق المحل/المطعم | [`store-app/`](./store-app) | تصميم تطبيق موبايل + Splash Screen (10 ثوانٍ) | `5175` |

## التقنيات

- **TypeScript**
- **React 19 + Vite**
- **Tailwind CSS v4**
- **React Router**
- **Lucide Icons**
- خط **IBM Plex Sans Arabic** — واجهات RTL بالكامل

## الهوية البصرية

حسب المواصفات الرسمية في [`clean_docs/`](./clean_docs): نظام ألوان أبيض/أسود صارم مع تدرجات رمادية (`#000` / `#FFF` / `#F5F5F5` / `#E0E0E0` / `#666` / `#999`).

> **ملاحظة:** المشاريع فرونت-إند بالكامل وبدون أي بيانات وهمية (Mock). جميع الجداول والقوائم تعرض حالات فارغة (Empty States) احترافية، وجاهزة للربط المباشر بأي Back-end.

## التشغيل محلياً

داخل كل مجلد مشروع:

```bash
npm install
npm run dev      # للتطوير
npm run build    # للإنتاج (مجلد dist)
```

## الرفع على Vercel

كل مشروع يُرفع **بشكل مستقل** (ثلاثة مشاريع في Vercel):

1. أنشئ مشروع Vercel جديد واختر المستودع.
2. حدد **Root Directory** لكل مشروع: `admin-dashboard` أو `captain-app` أو `store-app`.
3. الإعدادات تُكتشف تلقائياً (Vite): Build = `npm run build`، Output = `dist`.
4. ملف `vercel.json` موجود في كل مشروع لدعم توجيه SPA (rewrites).
