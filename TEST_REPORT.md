# Test Report

## Environment constraint (read this first)

This build environment has **no outbound network access** — verified directly:

```
querySrv ECONNREFUSED _mongodb._tcp.indooraxe.iokfmkl.mongodb.net   (Atlas unreachable)
Docker daemon not running / no cached images                        (can't stand up local Mongo either)
```

That means the following could **not** be exercised end-to-end in this session, regardless of how correct the code is:
- Real MongoDB reads/writes (Atlas is unreachable from here).
- Real Google OAuth login (no client ID/secret supplied, and the OAuth redirect requires live network access to `accounts.google.com`).
- Real Razorpay order creation/payment (no real key/secret supplied; `RAZORPAY_KEY_ID`/`SECRET` are `.env.example` placeholders).

Everything below reflects what **was** actually verified in this environment, not a claim of full production readiness. See "What you need to do before go-live" at the end for the exact steps to finish verification on a machine with internet access.

## What was verified, and how

### Backend
- **Syntax**: every file under `backend/src` passes `node --check` (no parse errors).
- **Module load**: `backend/src/app.js` (routes, models, Passport config, Mongoose schemas) imports and initializes cleanly with a dummy `.env` — confirms no circular-import or wiring bugs across the ~40 backend files.
- **Live HTTP smoke test**: started the real Express app (bypassing the MongoDB connection step) and hit it with `curl`:
  - `GET /api/health` → `200 {"ok":true}`, with `helmet` security headers (CSP, X-Frame-Options, etc.) and `cors` headers scoped to `http://localhost:5173` with credentials — all present and correct.
  - `GET /api/nonexistent` → `404 {"message":"Not found"}` via the catch-all handler.
- **Dependency audit**: `npm install` reports 0 vulnerabilities (upgraded `multer` from the 1.x line, which `npm audit` flagged as vulnerable, to 2.x during scaffolding).
- **Code review**: pricing service, order/demand-order controllers, Razorpay signature verification, and the slug-generation utility were read in full and checked against the original Django arithmetic/behavior line-by-line (see `API_MAPPING.md` and `DATABASE_MAPPING.md` for the specific formulas and the three confirmed behavior deviations).

### Frontend
- **Production build**: `npx vite build` succeeds cleanly — 137 modules transformed, no errors, at every checkpoint during the build-out (after the scaffold, and again after all 7 page-building agents finished).
- **Live dev server smoke test**: started the real Vite dev server and confirmed `GET http://localhost:5173/` returns `200` with the React app shell (module scripts, HMR client) — the SPA itself boots correctly.
- **Asset integrity**: every `/images/...` and `/Bourcher_Indoor.pdf` path referenced anywhere in `frontend/src` was grep-checked against `frontend/public` — all resolve, nothing broken.
- **Branding**: grepped the entire new frontend for the old `looogo.png`/colorlib branding and for the leaked Razorpay live key (`rzp_live_dPjRgbMUJ1SYnr`) — zero matches in either the new frontend or backend. New logos are used via `object-contain` (no distortion) in `Header`, `Footer`, and as the favicon.
- **Manual code review** of the highest-risk pages: `ProductDetail.jsx` (price-estimator form logic, Accessories-type conditional fields, addon/state lookups), `Payment.jsx` (Razorpay checkout wiring, error handling), `OrdersAdmin.jsx` (optimistic status-update with rollback-on-failure). One real defect was found and fixed during this review (see below).

### Issue found and fixed during review
- **`ProductDetail.jsx`** was rendering a hardcoded 4-star rating on every single product with no backing data (the original product page never showed a product-level rating, only per-testimonial star counts) — this was a fabricated trust signal invented during page-building and has been removed.

### Known limitations / simplifications (not defects, documented so nothing is a surprise later)
- **Blog rich-text editing** in the admin panel uses a plain `<textarea>` accepting raw HTML source, not a WYSIWYG editor — the original used CKEditor. Content storage/rendering is unaffected (still HTML in, HTML rendered out), only the admin *authoring* experience is more basic. Swapping in a React rich-text editor (TipTap, CKEditor 5 React build) is a contained follow-up if wanted.
- **`PRODUCT_TYPES`/`ORDER_STATUSES`** enum values are duplicated as literal string arrays in two admin frontend files (`ProductsAdmin.jsx`, `OrdersAdmin.jsx`) with a comment pointing at their backend source of truth (`backend/src/models/Product.js`/`Order.js`), since the frontend and backend are separate builds and can't share a literal ES import. If either enum changes later, both copies need updating together.
- **Showcase project 6** intentionally renders identical content to project 5 (same image, same text) — this reproduces an actual bug in the original `ject6.html` template (it was a copy-paste of `ject5.html` that was never finished), not a bug introduced during migration. A real, distinct image (`indoor/static/assets/img/projects/6.png`) exists in the source repo but was never wired up by the original site either.
- **`npm audit` (frontend)**: `vite`/`esbuild` report one moderate advisory affecting the *dev server only* (a CORS issue allowing any site to query the Vite dev server while it's running) — not exploitable in a production build, fix requires an upgrade to Vite 8 (a breaking major-version jump not undertaken here since it wasn't requested).

## Manual audit round 2 (post-delivery, requested by user)

After the initial build, a full audit pass was run across every backend file and all 33 frontend pages, checking specifically for: broken navigation, API-contract mismatches between frontend calls and actual backend routes, missing loading/error states, leftover placeholder content, and money-flow correctness. Four parallel review agents were dispatched for this; three hit a session usage limit and one stalled before returning findings, so **this audit was completed manually** instead: every internal `<Link>`/`navigate()` target was grep-checked against the real route table in `App.jsx`, every `api.*()` call in the frontend was cross-referenced against its actual backend route/controller, every multipart upload's field names were checked against the corresponding `multer` config, and the majority of page files were read in full.

**Real issues found and fixed:**
1. `ProductDetail.jsx` rendered a hardcoded 4-star rating on every product with no backing data — a fabricated trust signal not present in the original. Removed.
2. `Products.jsx`'s breadcrumb used a plain `<a href="/">` instead of React Router's `<Link>`, forcing an unnecessary full-page reload. Fixed.
3. `Header.jsx`, `Footer.jsx`, and `OrderQuote.jsx` displayed `info@indooraxe.com`, while `Contact.jsx` (built independently) displayed `info@indooraxe.in`. The real registered domain, confirmed from `django_site` in the original `db.sqlite3`, is `indooraxe.in` — all three were aligned to `.in`.

**Flagged for your decision (not fixed, not a migration defect):** `OrderQuote.jsx`'s "Payment To" bank-transfer block (HDFC Bank, Account No. 1234567890, IFSC HDFC000012) was ported verbatim from the original `quote.html` (only fixing its "Accpunt" typo to "Account") - this is real content that existed in the live site already. The account number and IFSC code look like unedited demo placeholder values from the paid template the original site was built on (the IFSC format isn't valid, and the account number is a suspiciously round sequence), not a real bank account. If customers ever used this to wire money directly instead of paying through Razorpay, it may not have gone anywhere real. Decide whether to: (a) replace it with your actual bank details if you want to keep offering manual bank transfer as an option, or (b) remove the block entirely since Razorpay is the only real payment path in this app.

**Everything else checked out clean:** no broken internal links found anywhere in the site (checked every page and every shared component), no API-contract mismatches between any frontend call and its backend route, no leftover Lorem-ipsum/TODO/placeholder content, `dangerouslySetInnerHTML` is used in exactly one place as intended (blog rich-text rendering), and all admin CRUD forms send exactly the field names their backend controllers expect.

## Original data migrated from SQLite to MongoDB Atlas

Every row from the live original database (`indoor/db.sqlite3`) has been migrated into Atlas via a new, idempotent, re-runnable script: `backend/src/utils/migration/migrateFromDjango.js` (run with `npm run migrate:django` from `backend/`). It reads a full JSON dump of the original database (`backend/src/utils/migration/django-dump.json`) and writes into MongoDB, resolving every relationship along the way. All 110 referenced product/blog image files were also copied from `indoor/media/` into `backend/uploads/` (counts verified to match exactly before and after the copy).

**Verified counts (source SQLite row count → migrated MongoDB document count), confirmed independently by querying Atlas directly, not just trusting the script's own log:**

| Data | Source rows | Migrated | Notes |
|---|---|---|---|
| Products | 21 | 21 | 100% — includes all images |
| Blogs | 3 | 3 | 100% — includes rich-text content, thumbnails, banners |
| Contacts | 4 | 4 | 100%, including two that look like spam/bot submissions — migrated as-is, not filtered, since it's real historical data |
| Delivery charges | 36 | 35 | 1 exact duplicate row in the source data ("Chandigargh", listed twice with the same price) was skipped rather than violating the new schema's uniqueness constraint — flagged, not silently dropped |
| Orders | 9 | 9 | 100% — every order's product reference, addon reference, and customer reference resolved successfully with **zero unresolved links** |
| Demand orders (ad-hoc payments) | 2 | 2 | 100% |
| User accounts | 8 auth_user rows | 6 migrated + 1 merged + 1 skipped | See below |

**User account handling required a judgment call, documented here rather than made silently:** the original database has 8 Django user rows, but two of them (`Minaketan`, a superuser account with no Google link, and `ketan`, a real Google-linked customer account) share the exact same email (`revarionceo@gmail.com`) — clearly the same real person, split across two rows because one was created via Django's `createsuperuser` command and the other via actual Google sign-in. Since the new schema enforces one account per email, these were merged into a single user (role `admin`, keeping the real Google ID from the `ketan` row) rather than migrated as two separate accounts. One more row (`Samarpan`, a superuser with no email on record at all) had no way to be linked to a real login method and was skipped — it never placed any order under that username either, so nothing else references it. Every order's `User` field (a Django username string) was successfully matched to its corresponding migrated account, including the 6 orders originally placed under `Minaketan`, which now correctly resolve to the merged account.

## Local run — both servers verified live in this session

Ports 5000 and 5173 were already taken by other, unrelated processes on this machine, so this project runs on **5050** (backend) and **5174** (frontend) instead — `backend/.env`, `backend/.env.example`'s runtime copy, and `frontend/vite.config.js` are already set to these ports and were confirmed working end to end (real MongoDB round-trip through `GET /api/home`, and through the frontend's dev-server proxy).

1. `backend/.env` already exists with real values filled in for this session:
   - `MONGODB_URI` — your Atlas connection string (already there; confirmed working after you added this machine's IP to Atlas Network Access — the initial connection attempt failed until that was added).
   - `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` — reused from the original app's live Google OAuth client (pulled from `db.sqlite3`, since allauth never stored these in source). **You still need to add `http://localhost:5050/api/auth/google/callback` (and your production callback URL) to this client's Authorized Redirect URIs in Google Cloud Console** — the old Django callback path is different and won't match, and the port changed from the original plan (5000 → 5050) due to the port conflict above.
   - `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` — still placeholders. **Rotate the key first**; the old one was hardcoded in the original Django source (`rzp_live_dPjRgbMUJ1SYnr`) and should be treated as compromised. Paste the new key/secret in before testing any payment flow.
   - `JWT_SECRET` — already filled with a random value; regenerate for real production use.
   - `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` — set to `indooraxe@gmail.com` / `Indooraxe@2026` per your request, and already seeded into the database (see below).
2. `npm run seed` was already run in `backend/` — the `indooraxe@gmail.com` admin account exists in Atlas with the password hashed (bcrypt). Re-run this anytime you change `BOOTSTRAP_ADMIN_PASSWORD` in `.env` to update it.
3. Both dev servers are already running in the background for this session: backend on `http://localhost:5050`, frontend on `http://localhost:5174`. Open `http://localhost:5174` to check them yourself. To restart them later: `cd backend && npm run dev` and `cd frontend && npm run dev`.
4. Walk the flows end to end with real data:
   - **Customer path**: Google login (any real Google account) → browse a product → submit the price estimator → checkout → pay with a real (or Razorpay test-mode) card, once a real key is set → confirm the order shows up in `/dashboard` with `isPaid: true`.
   - **Admin path**: go to `/admin/login`, sign in with `indooraxe@gmail.com` / `Indooraxe@2026` → confirm you land on `/admin` and can see/manage the order from the customer path above in `/admin/orders`.
   - Atlas is now populated with the full original catalog (21 products, 3 blogs, 35 delivery charges, all historical orders) — see "Original data migrated" above — so both flows have real data to work with immediately.
5. Decide what to do about the placeholder bank-transfer details on the quote page (see the audit finding above) before this goes live.
6. Re-run through `FEATURE_CHECKLIST.md` and flip each `T` (Tested) box on as you confirm it live — every `C`/`V` box is already checked from this session's review.
