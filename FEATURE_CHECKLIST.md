# Feature Parity Checklist

Status legend: `C` Completed (code written) · `V` Verified (matches original behavior on code inspection + successful build) · `T` Tested (exercised end-to-end against the running app with real data)

**On `T` (Tested):** the initial build was reviewed in a network-isolated environment (no live DB/OAuth), so most rows below were only `C`+`V` at first. The app has since been run locally with real MongoDB Atlas data and real servers (see `TEST_REPORT.md`) — rows confirmed live there are marked `T` too; anything still `C`+`V` only just hasn't been personally clicked through yet.

## Authentication
- [x] Google OAuth login — `C` `V`
- [x] Email + password login — `C` `V` `T` (new, not in the original app - see below)
- [x] Email + password registration — `C` `V` `T` (new, not in the original app - see below)
- [x] Session persistence (JWT httpOnly cookie) — `C` `V` `T`
- [x] Logout — `C` `V`
- [x] Route gating equivalent to `login_required` on: product detail, order form, checkout/booking, payment, bill (show), quote, dashboard — `C` `V`
- [x] Admin role gating equivalent to Django staff/superuser — `C` `V`
- [x] Separate admin sign-in page (`/admin/login`), using the same email+password login as customers, gated to `role: admin` — `C` `V` `T`
- [x] **New (not in original, added by request):** separate local email+password admin login (`/admin/login`, `POST /api/auth/admin-login`), seeded via `npm run seed` — `C` `V`

## Marketing / Content pages
- [x] Home (featured products + blogs) — `C` `V`
- [x] About — `C` `V`
- [x] Landing page + lead form — `C` `V`
- [x] Thank-you page — `C` `V`
- [x] Terms — `C` `V`
- [x] Privacy — `C` `V`
- [x] Showcase pages ject1–ject6 (→ `/showcase/1`..`/showcase/6`) — `C` `V`
- [x] Custom 404 / error boundary — `C` `V`

## Products
- [x] Product listing by type — `C` `V`
- [x] Product detail + image gallery (up to 11 images) — `C` `V`
- [x] Price estimator form (qty/length/breadth/addon/state) — `C` `V`
- [x] Delivery/logistics charge lookup by state — `C` `V`

## Blog
- [x] Blog listing (unfiltered, matches original exactly) — `C` `V`
- [x] Blog detail (rich text render) — `C` `V`

## Orders & Checkout
- [x] Order creation with server-side pricing (area × price/sqft + addon + 18% GST + logistics) — `C` `V`
- [x] Checkout / billing address collection (fixed to update in place, per confirmed decision) — `C` `V`
- [x] Bill view with CGST/SGST split (addon-cost-in-GST inconsistency resolved, per confirmed decision) — `C` `V`
- [x] Quote view (with addon cost) — `C` `V`
- [x] Order status field (Received/Shipped/Delivering/Delivered) — `C` `V`
- [x] Customer dashboard (own orders only) — `C` `V`

## Payments (Razorpay)
- [x] Order payment flow (create order + checkout widget) — `C` `V`
- [x] Payment success callback (Order), now with HMAC signature verification (per confirmed decision) — `C` `V`
- [x] Ad-hoc "pay anything" flow (Demand Order: form → paycheck → widget) — `C` `V`
- [x] Payment success callback (Demand Order), signature-verified — `C` `V`
- [x] Payment success/failure pages — `C` `V`

## Contact / Leads
- [x] Contact form submission storage — `C` `V`
- [x] Landing page lead form submission storage (same collection, per original) — `C` `V`

## Admin panel (replacing Django admin)
- [x] Product CRUD + search — `C` `V`
- [x] Blog CRUD + search/filter — `C` `V`
- [x] Order management (view/search/update status) — `C` `V`
- [x] Demand-order management (list/search only, matches available backend routes) — `C` `V`
- [x] Contact submissions viewer + delete — `C` `V`
- [x] Delivery charge CRUD — `C` `V`
- [x] Testimonials CRUD (preserved though unused by public frontend today) — `C` `V`
- [x] Client-logo CRUD (preserved though unused by public frontend today) — `C` `V`

## Uploads
- [x] Product images (main + pic1-10) — `C` `V`
- [x] Blog thumbnail + banner — `C` `V`
- [x] Testimonial photo / client logo — `C` `V`

## Branding
- [x] New logos applied to header/footer/favicon without distortion (object-contain, no stretching) — `C` `V`
- [x] No leftover references to the old `looogo.png`/colorlib branding or the leaked Razorpay live key in the new codebase (grep-verified) — `C` `V`

## New functionality added beyond the original app (by explicit request)
- Local email+password registration and login for customers (`POST /api/auth/register`, `POST /api/auth/login`), alongside the original Google-only OAuth flow. Registering and Google sign-in both resolve to one account per email.
- A dedicated admin sign-in page (`/admin/login`) using the same login endpoint, gated to accounts with `role: admin`.

## Explicitly out of scope (confirmed absent from original — not a regression)
- No email/OTP verification — never existed in the source app, and not requested for the new password login either.
- No REST API in the original — this is new by nature of the MERN rebuild, not a ported feature.
