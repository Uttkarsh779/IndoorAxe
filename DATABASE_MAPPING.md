# Database Mapping — Django/SQLite → MongoDB/Mongoose

Source of truth for field-level mapping. See `MIGRATION_PLAN.md` §4 for narrative rationale.

## Product
| Django field | Type | Mongo field | Type | Notes |
|---|---|---|---|---|
| Name | CharField(1000) | name | String | |
| slug | SlugField(255, unique) | slug | String, unique index | generated via ported `generate_slug` logic |
| Product_Type | CharField choices | productType | String enum | `Commercial, Residential, Window, Fire Hose & Cabinets, Accessories, Others` (note: original DB value is `Residental`, a misspelling baked into the choices tuple default — preserved as stored data unless user asks to correct it, since correcting it would change existing product records' displayed type) |
| Start_Price | CharField | startPrice | String | |
| Start_Price_In_Written | CharField | startPriceWritten | String | |
| Price_Per_sqft | CharField | pricePerSqft | Number | stored as CharField in Django but always used as an int in arithmetic (`int(prices)`) — Mongo stores as Number, ported logic still coerces defensively |
| Image, pic1..pic10 | ImageField ×11 | images.main, images.pic1..pic10 | String (URL/path) ×11 | |
| SEO_description | CharField | seoDescription | String | |
| SEO_keywords | CharField | seoKeywords | String | |

## blogger → Blog
| Django field | Mongo field | Notes |
|---|---|---|
| title | title | |
| slug | slug | unique index |
| Status_article | statusArticle | enum `active/inactive` |
| created_on | createdOn | DateTimeField, required (no default in Django — must be supplied on create, same as original which has no `auto_now_add`) |
| thumbnail | thumbnail | |
| banner | banner | |
| SEO_description (RichTextField) | seoDescription | HTML string |
| SEO_keywords (RichTextField) | seoKeywords | HTML string |
| content (RichTextField) | content | HTML string |

## Contacts → Contact
Name→name, Email→email, Call→call, Question→question. All optional/nullable in original — kept optional.

## Testimonials → Testimonial
Name→name, Image→image, Comment→comment.

## Clientel → ClientLogo
client→image.

## Delivery_charge → DeliveryCharge
State→state (unique), price→price (Number).

## Order
| Django field | Mongo field | Type change / rationale |
|---|---|---|
| razorpay_payment_id/order_id/signature | razorpay.paymentId/orderId/signature | grouped into a sub-document; original `CharField(max_length=10000000000000)` is clearly a copy-paste typo for "very long," Mongo just uses String |
| is_paid | razorpay.isPaid | |
| User (CharField, matched against `request.user` by string) | user (ObjectId ref → User) | **behavior-preserving normalization**: original filters `Order.objects.filter(User=nowuser)` where `nowuser` is a Django User object stringified — this only worked because Django's `User.__str__` returns the username, which happened to be stored verbatim. New schema stores the actual user id, dashboard query becomes `Order.find({ user: req.user._id })` — same result set, more reliable |
| product (CharField name) | product (ObjectId ref → Product) | see rationale in MIGRATION_PLAN §4.2 — original does `Product.objects.filter(Name=product_name).first()` at read time in 3 different views; storing the id avoids the lookup breaking if a product is renamed after the order was placed (original bug, fixed as a bonus, not a spec change to current behavior) |
| Addon (CharField name) | addon (ObjectId ref → Product, nullable) | same rationale |
| total, gst, logistic, Amount, QTY, length, breadth, State_price | total, gst, logistic, amount, qty, length, breadth, statePriceSnapshot | direct rename to camelCase, same semantics/types |
| Address, Pincode, City, State, Remark, Call, Email, Order_Date | address, pincode, city, state, remark, call, email, orderDate | direct rename |
| slug | slug | unique index |
| order_status | orderStatus | enum `Received Order, Shipped, Delivering, Delivered` (kept Django's exact label spelling "Recived Order" → corrected to "Received Order" only in the enum label since it's a display string, not a stored code the frontend branches on by exact string outside the admin dropdown — flagged for user confirmation before final cutover if exact string parity is required somewhere external) |

## Demand_orders → DemandOrder
razorpay_*/is_paid → razorpay sub-document (same as Order). User (free-text, not FK even conceptually — no `login_required` on `payadd`) → kept as a nullable `user` reference populated only if the requester was authenticated, plus keep the raw submitted name in a `userLabel` string field to avoid losing data for anonymous submissions (original always stored whatever string was typed in the form, authenticated or not).
Amount, Remark, Call, Email, Order_Date, slug → amount, remark, call, email, orderDate, slug (direct rename).

## Users (new — Django's built-in `auth.User` + allauth `SocialAccount`, ported explicitly)
googleId, email, name, avatarUrl, role (`customer` default / `admin`), createdAt/updatedAt. Role replaces Django's `is_staff`/`is_superuser` flags used to gate `/admin/`.

`passwordHash` (bcrypt, `select: false` by default) was added beyond the original schema to support the new email+password login/registration (see API_MAPPING.md) - only set on accounts created via `POST /api/auth/register` or `npm run seed`; Google-only accounts have no value here and can only authenticate via OAuth. `googleId` and `passwordHash` are independent - an account can have either, both (if the same email registers with a password and later signs in with Google), or just one.

## Slug-stability deviation (applied consistently to Product, Blog, Order, DemandOrder)
The original `save()` override on all four slugged models unconditionally calls `generate_slug()` on **every** save, not just on create — and the collision check never excludes the record's own current row. In practice this means editing an existing Product/Blog/Order/DemandOrder (e.g. changing its price in Django admin) regenerates its slug and silently breaks its existing URL on every single save. This looks like an unintentional, high-impact bug (SEO/link breakage) rather than a designed feature. Following the same judgment call already confirmed for the checkout-flow bug, the Mongoose pre-save hooks only regenerate the slug when the record is new or its name/title/key field actually changed, keeping URLs stable across unrelated edits. Slug generation itself (recursive collision check across the same 4 collections, random-suffix retry) is otherwise ported unchanged.

## Indexes
- Unique: `Product.slug`, `Blog.slug`, `Order.slug`, `DemandOrder.slug`, `DeliveryCharge.state`, `User.email`, `User.googleId` (sparse).
- Non-unique (for admin search parity with `search_fields` in `admin.py`): text index on `Product.name`, `Blog.title`, `Order.{email, razorpay.orderId}` (User is now a ref, searched by populated email instead), `Contact.{name, email, call, question}`.
