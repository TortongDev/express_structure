# Auth Guide — CAFEI Backoffice

## ใครเรียก → ใช้ Auth อะไร → Middleware ไหน

| ผู้เรียก | Route | Auth Method | Header / Cookie | Middleware |
|---|---|---|---|---|
| **Staff เปิดเว็บ backoffice** | `/dashboard/*`, `/settings/*` | Cookie JWT | `Cookie: access_token=...` | `requireSession.js` |
| **Mobile App / SPA (frontend เรา)** | `/api/v1/*` | Bearer JWT | `Authorization: Bearer <token>` | `requireAuth.js` |
| **เว็บ / ระบบคนอื่น (third-party)** | `/api/v1/*` | API Key | `X-Api-Key: cafei_live_xxx` | `requireApiKey.js` |
| **Server ภายใน (server คุยกัน)** | `/api/internal/*` | Shared Secret | `X-Internal-Secret: <secret>` | `internalOnly.js` |

---

## 1. Cookie JWT — Staff Backoffice

**ใครใช้:** Staff login ผ่านหน้าเว็บ EJS (`/auth/login`)

**Flow:**
```
Staff กรอก username/password
  → POST /auth/login
  → Server set cookie: access_token + refresh_token (httpOnly)
  → Browser แนบ cookie อัตโนมัติทุก request
  → requireSession.js อ่าน cookie → verify JWT → req.user
```

**ตัวอย่าง request** (Browser ทำให้อัตโนมัติ):
```http
GET /dashboard
Cookie: access_token=eyJhbGc...
```

**Token หมดอายุ:** redirect ไป `/auth/refresh` อัตโนมัติ (silent refresh)

**ไฟล์:** `src/middlewares/requireSession.js`

---

## 2. Bearer JWT — Mobile App / Frontend SPA (ของเรา)

**ใครใช้:** App มือถือ, React/Vue frontend ที่ user ต้อง login ก่อน

**Flow:**
```
App เรียก POST /api/v1/auth/login  (username/password)
  → Server คืน { accessToken, refreshToken }
  → App เก็บ token ไว้เอง (localStorage / SecureStorage)
  → ทุก request แนบ Authorization header
  → requireAuth.js อ่าน header → verify JWT → req.user
```

**ตัวอย่าง request:**
```http
GET /api/v1/profile
Authorization: Bearer eyJhbGc...
```

**Token หมดอายุ:** App ต้องเรียก `/api/v1/auth/refresh` เอง แล้วได้ token ใหม่

**ไฟล์:** `src/middlewares/requireAuth.js`

---

## 3. API Key — ระบบคนอื่น (Third-party)

**ใครใช้:** ระบบภายนอกที่ต้องการดึงข้อมูล เช่น POS อื่น, Delivery platform, Accounting software

**Flow:**
```
Admin generate key ด้วย: node scripts/generate-api-key.js
  → ได้ RAW KEY (ส่งให้ third-party) + HASH (เก็บใน DB)
  → ระบบภายนอกเก็บ raw key ไว้
  → ทุก request แนบ X-Api-Key header
  → requireApiKey.js hash key แล้วค้นหาใน DB → req.apiClient
```

**ตัวอย่าง request:**
```http
GET /api/v1/menu
X-Api-Key: cafei_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Key format:**
- `cafei_live_` = production key
- `cafei_test_` = test/dev key

**Security:**
- Raw key ไม่ถูกเก็บใน DB — เก็บแค่ SHA-256 hash
- Admin ปิด key ได้ทันทีโดย set `is_active = false`
- รองรับ `expires_at` กำหนดวันหมดอายุได้
- `last_used_at` บันทึกทุกครั้งที่ key ถูกใช้ (async, ไม่ block request)

**Generate key ใหม่:**
```bash
node scripts/generate-api-key.js        # live key
node scripts/generate-api-key.js test   # test key
```

**ไฟล์:** `src/middlewares/requireApiKey.js`

---

## 4. Shared Secret — Server ภายใน (Internal)

**ใครใช้:** Server อื่นในระบบ CAFEI เช่น customer webapp, kitchen display, cron job

**Flow:**
```
Server A ต้องการข้อมูลจาก backoffice
  → อ่าน INTERNAL_API_SECRET จาก .env
  → แนบ X-Internal-Secret header
  → internalOnly.js ตรวจ secret → next()
```

**ตัวอย่าง request:**
```http
GET /api/internal/health
X-Internal-Secret: my-super-secret-123
```

**หมายเหตุ:** Nginx block `/api/internal/*` จาก Internet — เรียกได้เฉพาะ server ในเครื่องเดียวกัน / VPN

**ไฟล์:** `src/middlewares/internalOnly.js`

---

## สรุป Token / Key แต่ละแบบ

| | JWT (Cookie) | JWT (Bearer) | API Key | Shared Secret |
|---|---|---|---|---|
| **เก็บที่ไหน** | httpOnly cookie | App storage | DB (`ApiKey` table) | `.env` |
| **หมดอายุ** | 15 นาที | 15 นาที | ไม่หมด (revoke ได้) | ไม่หมด (rotate ได้) |
| **Refresh** | อัตโนมัติ (cookie) | App เรียกเอง | ไม่มี | เปลี่ยน env |
| **Revoke** | ลบ refresh token จาก DB | ลบ refresh token จาก DB | ปิด flag ใน DB | เปลี่ยน env |

---

## Middleware ใช้กับ Route ไหน

```js
// EJS pages — Staff backoffice
router.get('/dashboard', requireSession, dashboardController);

// Public API — Mobile / SPA (user login)
router.get('/api/v1/profile', requireAuth, profileController);

// Public API — Third-party (API Key)
router.get('/api/v1/menu', requireApiKey, menuController);

// Internal API — Server-to-server
router.get('/api/internal/orders', internalOnly, ordersController);
```

---

## ไฟล์ที่เกี่ยวข้อง

```
src/middlewares/
  ├── requireSession.js   ← Cookie JWT (EJS backoffice)
  ├── requireAuth.js      ← Bearer JWT (Mobile/SPA)
  ├── requireApiKey.js    ← API Key (Third-party)
  ├── internalOnly.js     ← Shared Secret (Server-to-server)
  └── requireRole.js      ← Role check (ใช้ต่อจาก requireSession/requireAuth)

src/lib/
  ├── jwt.js              ← sign / verify JWT
  └── prisma.js           ← DB client

src/routes/
  ├── auth.ejs.route.js       ← /auth/*
  ├── api/v1/index.js         ← /api/v1/*
  └── api/internal/index.js   ← /api/internal/*

scripts/
  └── generate-api-key.js     ← สร้าง API Key ใหม่สำหรับ third-party

prisma/schema.prisma
  └── model ApiKey            ← table api_keys
```

---

## หมายเหตุ Migration

DB ต้องรัน migrate ก่อนใช้ `requireApiKey.js`:
```bash
npx prisma migrate dev --name add_table_api_key
```
