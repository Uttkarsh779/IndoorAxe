# Indooraxe — Django → MERN Migration Plan

## 0. Correction to scope assumptions

The task brief assumes a **Django + Flask** hybrid. The audited repository (`indoor/`) contains **only a Django 3.2 project** — one app (`project`), served via **Passenger WSGI** (cPanel-style shared hosting: `passenger_wsgi.py`, `tmp/restart.txt`). There is no Flask service, no separate microservice, no Celery, no Redis, no websocket layer, and no management commands beyond Django's stock ones. This plan documents the **actual** system rather than the assumed one. Nothing below is invented — every item is traced to a file/line in `indoor/`.

Repo root layout found:
```
Indooraxe/
├── Indoor Axe Logo White BG.png       # new branding asset
├── Indoor Axe Logo Without BG.png     # new branding asset
├── Indoor Axe Logo.jpeg               # new branding asset
└── indoor/                            # the Django reference app (DO NOT MODIFY)
```

---

## 1. Project Structure

### 1.1 Django project (`indoor/indoor/`)
| File | Purpose |
|---|---|
| `settings.py` | Single settings module, `DEBUG=True`, SQLite DB, hardcoded `SECRET_KEY`, allauth + ckeditor + razorpay apps installed |
| `urls.py` | Root URLconf: mounts `project.urls`, Django admin, `allauth.urls`; defines **every** HTTP error-code handler (300–511) to two views |
| `wsgi.py` / `asgi.py` | Standard entrypoints |
| `passenger_wsgi.py` | cPanel/Passenger shim importing the WSGI app — confirms shared hosting deployment, not containerized |

### 1.2 Django app (`indoor/project/`)
| File | Lines | Purpose |
|---|---|---|
| `models.py` | 140 | 8 models (see §4) |
| `views.py` | 301 | ~34 view functions — all function-based, no DRF/REST framework used anywhere |
| `urls.py` | 50 | ~30 URL patterns + static/media serving |
| `admin.py` | 36 | Custom `ModelAdmin` registrations (list_display/search_fields) for 6 of 8 models |
| `helpers.py` | 24 | `generate_slug()` (recursive uniqueness check against 4 models) + `generate_random_string()` |
| `apps.py`, `tests.py` | — | Boilerplate, no tests written |
| `migrations/` | 3 files | Standard Django migrations, no custom data migrations |

### 1.3 Templates (`indoor/template/`) — 32 files, 7,369 lines total
Server-rendered Django templates (Bootstrap 4 + jQuery "Colorlib"-style theme). No template inheritance (`{% extends %}` is never used) — every page repeats its own `<head>`/header/footer markup verbatim. Full inventory in §2.

### 1.4 Static assets (`indoor/static/`)
- `assets/css`, `assets/js`, `assets/fonts`, `assets/scss`, `assets/img`, `assets/landing` — Bootstrap 4, jQuery plugins (owl.carousel, nice-select, magnific-popup, superfish, hoverIntent), no build step (plain `<script>` tags, no npm/webpack).
- `assets/Bourcher_Indoor.pdf` — downloadable brochure linked from the products page.
- `ckeditor/` (7.7MB) — vendored CKEditor 4 assets for the `blogger` rich-text fields.
- `admin/` — Django's own admin static files (not to be ported; the new admin will be a React section).

### 1.5 Media (`indoor/media/`)
- `Product/` — product images (multiple resized/duplicate variants per Django's upload-collision suffixing, e.g. `10_CKQ18Uo.png`).
- `blog/thumbnail/`, `blog/Banner/` — blog images.
- No `Client/` or `Testimonials/` media exists yet, even though those models declare upload paths (see §1.6 dead code note).

### 1.6 Dead / unreachable code found (documented, not silently dropped)
- `views.element()` renders `element.html`, which **does not exist** in `template/`, and has **no URL route** in `project/urls.py`. Unreachable in production. Will be **ported as a placeholder route** in the new app for parity but flagged.
- `template/try.html` (10 lines) is not referenced by any view or URL.
- `Testimonials` and `Clientel` models are registered in Django admin but **no view ever queries them** — the testimonials shown on `product.html` are hardcoded HTML, not DB-driven. These models exist for admin data-entry only today. They will be fully preserved (schema + CRUD admin) since "assume every line exists for a reason," but flagged as currently-unconsumed-by-frontend.
- No cron/management commands, no websockets, no Celery/Redis — confirmed absent, not omitted.

### 1.7 Critical security finding (must fix during migration, not silently port)
`project/views.py` hardcodes **live** Razorpay credentials directly in source (`rzp_live_dPjRgbMUJ1SYnr` / secret) in two view functions, and `template/payment.html` hardcodes the same live key client-side. This is a production secret leak. The MERN backend will read these from environment variables (`.env`, never committed) instead — **recommend the user rotate this Razorpay key** since it has been sitting in plaintext source.

---

## 2. Feature Inventory

```
Marketing / Content
✓ Home page (hero, featured products, featured blogs)              — home.html / views.home
✓ About Us                                                           — about.html / views.about
✓ Landing page (separate ad-campaign landing page + lead form)      — landing.html / views.landing, landing_form
✓ Thank-you page (post lead-form submit)                             — thank_you.html / views.thank_you
✓ Terms & Conditions                                                 — terms.html / views.terms
✓ Privacy Policy                                                     — privacy.html / views.privacy
✓ Project/portfolio showcase pages (6 static pages)                   — ject1..ject6.html / views.ject1..ject6
✓ Custom 404 handler + generic 4xx/5xx handler (30 status codes)     — indoor/urls.py handlers → views.handling/holdling

Products (catalog)
✓ Product listing (all types: Commercial/Residential/Window/Fire Hose & Cabinets/Accessories/Others) — products.html / views.products
✓ Product detail page (image gallery pic1-10, SEO fields, brochure link) — product.html / views.product (auth-gated)
✓ Product price estimator / order form (qty, length, breadth, addon, state, date) — product.html form → views.orderform
✓ Delivery/logistics charge lookup by state                          — Delivery_charge model, used in orderform + product page

Blog / CMS
✓ Blog listing                                                        — blogs.html / views.blogs
✓ Blog detail (CKEditor rich text content, SEO description/keywords)  — blog.html / views.blog
✓ Draft/Active status per article                                    — blogger.Status_article field

Authentication
✓ Google OAuth login (django-allauth, "Sign Up! / Login!" button)     — signup.html, allauth.urls
✓ Session-based auth gating (login_required on product/payment/dash/booking/orderform/show/quote) — views.py decorators
✓ Logout                                                              — views.signout
✗ No local username/password registration exists in the current app (verified: no signup POST handler, no password form in any template) — not a removed feature, never existed
✗ No email/OTP verification flow exists — not a removed feature, never existed

Ordering & Checkout
✓ Order creation from product estimator (server-side price calc: area × price/sqft + addon + 18% GST + logistics) — views.orderform
✓ Checkout / billing address collection (email, phone, address, city, state, pincode, remarks) — checkout.html / views.booking
✓ Order quote/bill view with GST split (CGST/SGST 9%/9%)             — show.html / views.show, quote.html / views.quote
✓ Order status tracking (Received/Shipped/Delivering/Delivered)       — Order.order_status
✓ Customer dashboard — list of the logged-in user's own orders        — dash.html / views.dash (filtered by `User` field, string match on request.user)

Payments (Razorpay)
✓ Order payment flow (Razorpay order creation + checkout widget + webhook-less client callback) — payment.html / views.payment, paysuccess
✓ "Pay anything" ad-hoc demand payment flow (separate from product orders) — payout.html / views.payout, payadd, paycheck
✓ Payment success / failure pages                                     — PaySuccess.html, PayFail.html / views.success, payfail
✓ Payment record persisted with razorpay_order_id/payment_id/signature/is_paid — Order + Demand_orders models

Contact / Leads
✓ Contact form (name, email, phone, question) → stored in DB          — contact.html / views.contactform
✓ Landing-page lead capture form (name, email, phone) → stored in DB  — landing.html / views.landing_form

Admin (Django admin — to be rebuilt as a custom React admin panel + protected API)
✓ Product CRUD (list, search by name)                                 — admin.py ProductAdmin
✓ Blog CRUD (list, search by title, filter status)                    — admin.py bloggerAdmin
✓ Order management (list/search by user, email, razorpay id; view all order fields incl. status) — admin.py OrderAdmin
✓ Demand-order management                                             — admin.py Demand_ordersAdmin
✓ Contact submissions viewer                                           — admin.py ContactAdmin
✓ Delivery charge (per-state pricing) CRUD                            — admin.py Delivery_chargeAdmin
✓ Testimonials CRUD (unused by frontend today, preserved for parity)  — admin.site.register(Testimonials)
✓ Client-logos CRUD (unused by frontend today, preserved for parity)  — admin.site.register(Clientel)
✓ Django admin site branding ("Indoor Axe Admin")                     — indoor/urls.py admin.site.site_header etc.

Uploads
✓ Product images (main + pic1-10, up to 11 images/product)            — Product model ImageFields
✓ Blog thumbnail + banner images                                       — blogger model ImageFields
✓ Testimonial photo, client logo                                       — Testimonials.Image, Clientel.client

Not present in original app (do not add as new scope)
✗ No notifications/email sending anywhere in the codebase (no SMTP config, no mail-sending view)
✗ No REST/JSON API — 100% server-rendered HTML forms/links
```

---

## 3. URL Mapping

All routes are unauthenticated GET unless noted. CSRF (`{% csrf_token %}`) is present on every POST form in the original.

| Django URL | View | Method | Auth | Frontend page (new React route) |
|---|---|---|---|---|
| `/` | `home` | GET | — | `/` Home |
| `/about` | `about` | GET | — | `/about` |
| `/contact` | `contact` | GET | — | `/contact` |
| `/contactform` | `contactform` | POST | — | (form action from `/contact`) |
| `/terms` | `terms` | GET | — | `/terms` |
| `/privacy` | `privacy` | GET | — | `/privacy` |
| `/products` | `products` | GET | — | `/products` |
| `/product/<slug>` | `product` | GET | **login required** | `/products/:slug` |
| `/orderform/<slug>` | `orderform` | POST | **login required** | (form action from product page) |
| `/blogs` | `blogs` | GET | — | `/blogs` |
| `/blog/<slug>` | `blog` | GET | — | `/blogs/:slug` |
| `/checkout` | `checkout` | GET | — | unused entry point (see note below) |
| `/booking/<slug>` | `booking` | GET+POST | **login required** | `/checkout/:slug` |
| `/payment/<slug>` | `payment` | GET+POST | **login required** | `/payment/:slug` |
| `/paysuccess` | `paysuccess` (Order variant) | POST, CSRF-exempt | — | Razorpay callback → `/payment-success` |
| `/success` | `success` (Demand_orders variant) | POST, CSRF-exempt | — | Razorpay callback → `/pay-success` |
| `/payfail` | `payfail` | GET | — | `/payment-failed` |
| `/payout` | `payout` | GET | — | `/payout` |
| `/payadd` | `payadd` | POST | — | (form action from `/payout`) |
| `/paycheck/<slug>` | `paycheck` | GET | — | `/payout/:slug` |
| `/show/<slug>` | `show` | GET | **login required** | `/orders/:slug/bill` |
| `/quote/<slug>` | `quote` | GET | **login required** | `/orders/:slug/quote` |
| `/dash` | `dash` | GET | **login required** | `/dashboard` |
| `/signup` | `signup` | GET | — | `/login` (Google OAuth entry) |
| `/signout` | `signout` | GET | **login required** implied | logout action |
| `/ject1` … `/ject6` | `ject1`…`ject6` | GET | — | `/showcase/1`…`/showcase/6` |
| `/landing` | `landing` | GET | — | `/landing` |
| `/landing_form` | `landing_form` | POST | — | (form action from `/landing`) |
| `/thank_you` | `thank_you` | GET | — | `/thank-you` |
| `/handling` | `handling` | GET | — | error boundary (404) |
| `/admin/*` | Django admin | — | staff/superuser | new `/admin/*` React section, JWT-protected, role check |
| `/accounts/*` | django-allauth | — | — | replaced by `/api/auth/google` (Passport.js) |
| `/media/*` | static serve | — | — | served from Express `/uploads` (or S3-compatible bucket) |

**Note on `/checkout`:** `views.checkout` only renders `checkout.html` with no context; the actual checkout data flow goes `orderform → booking (checkout.html with `post`) → payment`. `/checkout` with no slug appears to be a dead/legacy entry point (template expects `{{post}}` which would be undefined). Preserved as a route for parity, but the real flow is order-form-driven.

**Middleware mapped:**
- `SecurityMiddleware`, `CommonMiddleware`, `XFrameOptionsMiddleware` → `helmet` in Express.
- `SessionMiddleware` + `AuthenticationMiddleware` (+ allauth's `AccountMiddleware`) → `passport` + JWT (see §5).
- `CsrfViewMiddleware` → not needed the same way for a token-based JSON API (CSRF is a cookie-session risk); JWT-in-httpOnly-cookie will still get `csurf`-equivalent double-submit protection on state-changing routes, documented in API_MAPPING.md.
- `MessageMiddleware` → replaced by React toast/flash state (Context).

---

## 4. Database Analysis

### 4.1 Existing Django models (SQLite, **zero real foreign keys** — every "relationship" is a denormalized string match, not a Django `ForeignKey`)

| Model | Key fields | Notes |
|---|---|---|
| `Product` | `Name`, `slug` (unique), `Product_Type` (enum), `Start_Price`, `Start_Price_In_Written`, `Price_Per_sqft`, `Image` + `pic1..pic10`, `SEO_description`, `SEO_keywords` | Up to 11 images/product |
| `blogger` | `title`, `slug` (unique), `Status_article` (active/inactive), `created_on`, `thumbnail`, `banner`, `SEO_description`/`SEO_keywords`/`content` (CKEditor HTML) | |
| `Contacts` | `Name`, `Email`, `Call`, `Question` | Lead capture (contact form) |
| `Testimonials` | `Name`, `Image`, `Comment` | Unused by any view today (see §1.6) |
| `Clientel` | `client` (image) | Unused by any view today |
| `Order` | `razorpay_*`, `is_paid`, `User` (**CharField**, not FK to Django User!), `product` (**CharField name**, not FK to `Product`!), `total`, `gst`, `logistic`, `Addon` (CharField name), `Amount`, `QTY`, `length`, `breadth`, `Address/Pincode/City/State/State_price/Remark/Call/Email/Order_Date`, `slug`, `order_status` (enum) | Core order/quote/invoice record |
| `Demand_orders` | `razorpay_*`, `is_paid`, `User`, `Amount`, `Remark`, `Call`, `Email`, `Order_Date`, `slug` | Ad-hoc "pay anything" flow, independent of `Order` |
| `Delivery_charge` | `State`, `price` | Per-state logistics rate table, looked up by name in the order form |

`User` model itself is Django's built-in `auth.User`, populated only via Google OAuth (allauth `SocialAccount`), never via local registration.

### 4.2 MongoDB schema design (Mongoose)

Design decision: **the Mongo schema normalizes the string-based pseudo-relations into real `ObjectId` references** where it is safe and behavior-preserving (Product/Addon lookups, User ownership), while keeping every original field. This is an allowed "improve without changing behavior" change — the business logic (price lookup by product, order ownership by user) stays identical, it's just addressed by id instead of by fragile name-matching (name-matching breaks today if a product is renamed, which the new schema fixes as a bonus, not a spec change).

```
User
  _id
  googleId          (unique, sparse)         // from Google OAuth profile
  email             (unique)
  name
  avatarUrl
  role              enum['customer','admin']  default 'customer'  // replaces is_staff/is_superuser
  createdAt / updatedAt

Product
  _id
  name
  slug              (unique, indexed)
  productType        enum['Commercial','Residential','Window','Fire Hose & Cabinets','Accessories','Others']
  startPrice          String   // kept String to match "1 Lakh" style free-text values seen in data
  startPriceWritten   String
  pricePerSqft        Number
  seoDescription / seoKeywords
  images: { main, pic1..pic10 }  (stored as uploaded file paths/URLs)
  createdAt / updatedAt

Blog (was `blogger`)
  _id
  title
  slug (unique, indexed)
  statusArticle      enum['active','inactive']
  createdOn
  thumbnail / banner (paths/URLs)
  seoDescription / seoKeywords (HTML from rich text editor)
  content (HTML from rich text editor)

Contact
  _id, name, email, call, question, createdAt

Testimonial
  _id, name, image, comment, createdAt

ClientLogo (was `Clientel`)
  _id, image, createdAt

DeliveryCharge
  _id, state (unique), price

Order
  _id
  user            ObjectId → User            // was CharField name-match
  product         ObjectId → Product         // was CharField name-match
  addon           ObjectId → Product | null  // was CharField name-match
  qty, length, breadth
  pricePerSqftSnapshot   Number  // captured at order time so later product price edits don't retroactively change historical orders — preserves current (accidental) behavior of "price frozen at order time" since original code only reads Product at order-creation moment
  total, gst, logistic, amount, statePriceSnapshot
  address, pincode, city, state, remark, call, email, orderDate
  slug (unique, indexed)
  orderStatus     enum['Received Order','Shipped','Delivering','Delivered']  default 'Received Order'
  razorpay: { orderId, paymentId, signature, isPaid }
  createdAt / updatedAt

DemandOrder
  _id
  user (ObjectId → User, nullable — original User field is free text, not auth-linked)
  amount, remark, call, email, orderDate
  slug (unique, indexed)
  razorpay: { orderId, paymentId, signature, isPaid }
  createdAt / updatedAt
```

Indexes: unique index on every `slug` field (mirrors Django `unique=True` + the recursive `generate_slug` collision-avoidance logic, which is ported as-is into a Mongo pre-save hook); unique index on `Product.slug`, `Blog.slug`; unique on `User.email`/`User.googleId`; unique on `DeliveryCharge.state`.

Slug generation: `generate_slug()` in `helpers.py` recursively checks 4 models for collisions and appends a random suffix. Ported 1:1 as a shared `slugify.js` util that checks the same 4 collections (`Product`, `Blog`, `Order`, `DemandOrder`), preserving the exact collision-retry behavior.

---

## 5. Dependency Analysis

| Django/Python dependency | Purpose | MERN equivalent |
|---|---|---|
| `Django==3.2.x` | Web framework | `express` |
| `django-allauth` (+ `socialaccount`, Google provider) | Google OAuth login, session management | `passport` + `passport-google-oauth20`, JWT issued in httpOnly cookie |
| `django-ckeditor` | Rich text fields for blog content/SEO | `@ckeditor/ckeditor5-react` (or TipTap) on the admin blog-editor form; content stored as HTML string, same as today |
| `razorpay` (python SDK) | Payment order creation | `razorpay` (official Node SDK) |
| Django `contrib.admin` | Auto CRUD admin UI | Custom React admin section + protected `/api/admin/*` Express routes replicating each `ModelAdmin`'s list/search fields |
| Django `contrib.sessions`/`auth` | Session cookies, `login_required` | `jsonwebtoken` + `httpOnly` cookie, `requireAuth`/`requireAdmin` Express middleware |
| Django `contrib.staticfiles` / `MEDIA_ROOT` serving | Static & uploaded file serving | `multer` for uploads (disk storage under `/uploads`, served via Express static or proxied through Nginx in prod); Vite handles frontend static assets/bundling |
| SQLite | Database | MongoDB Atlas (connection string provided by user) via Mongoose |
| Passenger WSGI (cPanel hosting) | Process manager for shared hosting | Node process manager (PM2) or standard container/Node hosting — **not** determined yet, out of scope for this plan (deployment target to be confirmed) |
| No `requirements.txt` found in repo | — | New `backend/package.json` will pin exact versions |

No Celery, no Redis, no message queue, no cron — confirmed absent from the codebase (no `celery.py`, no scheduled management commands, no `django_celery_beat` in `INSTALLED_APPS`).

---

## 6. Migration Roadmap

### Phase 1 — Backend foundation
- `backend/` Express app skeleton: config, MongoDB/Mongoose connection (using the provided Atlas URI via `.env`), error-handling middleware, `helmet`/`cors`/`morgan` logging, health check.
- Mongoose models for all 10 collections in §4.2.
- Files: `backend/src/server.js`, `backend/src/config/db.js`, `backend/src/models/*.js`.

### Phase 2 — Authentication
- Google OAuth (`passport-google-oauth20`) matching the allauth flow: `GET /api/auth/google` → Google → `GET /api/auth/google/callback` → upsert `User`, issue JWT in httpOnly cookie → redirect to frontend.
- `requireAuth` middleware (equivalent to `login_required`) and `requireAdmin` middleware (equivalent to Django admin's staff check) gating the routes marked "login required" in §3 and all `/api/admin/*` routes.
- `POST /api/auth/logout`.
- Files: `backend/src/config/passport.js`, `backend/src/routes/auth.routes.js`, `backend/src/middleware/auth.js`.
- Frontend: `AuthContext`, `/login` page with "Continue with Google" button, `ProtectedRoute` wrapper.

### Phase 3 — Database & core CRUD APIs
- REST endpoints for Product, Blog, DeliveryCharge, Testimonial, ClientLogo, Contact (public read + admin write), matching admin.py's registered models.
- Multer upload handling for Product (up to 11 images), Blog (thumbnail+banner), Testimonial, ClientLogo.
- Files: `backend/src/routes/product.routes.js`, `blog.routes.js`, `delivery.routes.js`, `admin.routes.js`, matching `controllers/` and `services/`.

### Phase 4 — Orders, pricing engine, payments
- Port the exact pricing formulas from `views.orderform` / `views.show` / `views.quote` (area × price/sqft + addon×qty, 18% GST, 9%/9% CGST/SGST split, per-state logistics) into `backend/src/services/pricing.service.js` — unit-testable, single source of truth used by order creation, bill view, and quote view (today it's copy-pasted 3× in views.py; consolidating into one service is a legitimate "remove duplication" improvement per the code-quality instructions, with identical output).
- `Order` and `DemandOrder` CRUD + Razorpay order creation (`/api/orders/:slug/payment`, `/api/demand-orders/:slug/payment`) + payment callback endpoints (`/api/payments/order/callback`, `/api/payments/demand/callback`) replacing the CSRF-exempt `paysuccess`/`success` views.
- Customer dashboard endpoint: `GET /api/orders/mine` (filtered by authenticated user, replacing the `User` string-match in `views.dash`).

### Phase 5 — Frontend build-out
- Vite + React Router + Tailwind scaffold, shared `Layout` (header/nav/footer) extracted once from the 32 templates' repeated markup — a real improvement since the original never used `{% extends %}`.
- Route-by-route port per the table in §3, reusing: `ProductCard`, `BlogCard`, `PriceEstimatorForm`, `OrderSummaryTable`, `DataTable` (for admin lists), `Modal`, `Button`, `Input`.
- Razorpay Checkout.js integration via a small `useRazorpay` hook (replacing the inline `<script>` block in `payment.html`).
- New logos integrated in `Header`/`Footer`/favicon (see §7).

### Phase 6 — Admin panel
- React `/admin` section (role-gated) replicating each `ModelAdmin`: list views with the exact `list_display`/`search_fields` columns from `admin.py`, create/edit forms per model, delete.

### Phase 7 — Testing & parity verification
- Populate `FEATURE_CHECKLIST.md` with Completed/Verified/Tested status per item in §2.
- Manual/regression pass against the running Django app (side-by-side) for every route in §3.
- `TEST_REPORT.md` written from actual results (API tests + manual UI walkthroughs), not fabricated.

---

## 7. Branding

Three new logo files exist at the repo root: `Indoor Axe Logo White BG.png`, `Indoor Axe Logo Without BG.png`, `Indoor Axe Logo.jpeg`. Current site uses `static/assets/img/looogo.png` (header, every page) and `static/assets/img/logo.png`/`fav.png` (favicon). The new logos will replace these in the React `Header`, `Footer`, and favicon, sized via `object-fit: contain` (never stretched), with the transparent-background version used on dark headers and the white-BG version used where a solid backing is needed (e.g. favicon).

---

## 8. Open items requiring the user before/while Phase 1–2 are implemented

1. **Razorpay live key was hardcoded in source** (`rzp_live_dPjRgbMUJ1SYnr`) — recommend rotating it; the new backend will only ever read it from `.env`.
2. **Google OAuth Client ID/Secret** are not present anywhere in the audited repo (allauth reads them from the Django admin's "Social Application" DB table, not from settings.py) — needed to wire up real login; placeholder env vars will be used until supplied.
3. **Deployment target** or connection details for MongoDB Atlas are covered (URI given), but no target host for the new Node backend was specified — out of scope until asked.
