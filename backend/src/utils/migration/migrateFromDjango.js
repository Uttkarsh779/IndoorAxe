import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../../config/db.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Blog from '../../models/Blog.js';
import Contact from '../../models/Contact.js';
import DeliveryCharge from '../../models/DeliveryCharge.js';
import Order, { ORDER_STATUSES } from '../../models/Order.js';
import DemandOrder from '../../models/DemandOrder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dump = JSON.parse(fs.readFileSync(path.join(__dirname, 'django-dump.json'), 'utf-8'));

// Django's `Residental` typo (the actual choices-tuple default in the
// original models.py) maps to the corrected `Residential` enum value used
// by the new schema (see DATABASE_MAPPING.md).
const PRODUCT_TYPE_MAP = { Residental: 'Residential' };
function mapProductType(t) {
  return PRODUCT_TYPE_MAP[t] || t;
}

// Django's `Recived Order` typo maps to the corrected default status label.
const ORDER_STATUS_MAP = { 'Recived Order': 'Received Order' };
function mapOrderStatus(s) {
  const mapped = ORDER_STATUS_MAP[s] || s;
  return ORDER_STATUSES.includes(mapped) ? mapped : ORDER_STATUSES[0];
}

function uploadUrl(relPath) {
  if (!relPath) return '';
  return `/uploads/${relPath}`;
}

const report = {
  deliveryCharges: { source: 0, migrated: 0, skippedDuplicates: [] },
  users: { source: 0, migrated: 0, merged: [], skipped: [] },
  products: { source: 0, migrated: 0 },
  blogs: { source: 0, migrated: 0 },
  contacts: { source: 0, migrated: 0 },
  orders: { source: 0, migrated: 0, unresolvedProduct: [], unresolvedAddon: [], unresolvedUser: [] },
  demandOrders: { source: 0, migrated: 0 },
};

async function migrateDeliveryCharges() {
  const rows = dump.project_delivery_charge;
  report.deliveryCharges.source = rows.length;
  const seenStates = new Set();
  for (const row of rows) {
    const state = row.State.trim();
    if (seenStates.has(state.toLowerCase())) {
      report.deliveryCharges.skippedDuplicates.push({ id: row.id, state, price: row.price });
      continue;
    }
    seenStates.add(state.toLowerCase());
    await DeliveryCharge.updateOne(
      { state: new RegExp(`^${state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      { $set: { state, price: row.price } },
      { upsert: true }
    );
    report.deliveryCharges.migrated += 1;
  }
}

// Returns a map of Django username -> Mongo User document, after merging
// auth_user rows that share the same email (see MIGRATION note: the original
// DB has a superuser row and a Google-linked customer row sharing one email).
async function migrateUsers() {
  const users = dump.auth_user;
  const socialAccounts = dump.socialaccount_socialaccount;
  report.users.source = users.length;

  const socialByUserId = new Map(socialAccounts.map((s) => [s.user_id, s]));

  // Group Django user rows by email (case-insensitive), skipping rows with no email.
  const byEmail = new Map();
  for (const u of users) {
    const email = (u.email || '').toLowerCase().trim();
    if (!email) {
      report.users.skipped.push({ id: u.id, username: u.username, reason: 'no email on record' });
      continue;
    }
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email).push(u);
  }

  const usernameToUser = new Map();

  for (const [email, group] of byEmail.entries()) {
    const isAdmin = group.some((u) => u.is_staff || u.is_superuser);
    const social = group.map((u) => socialByUserId.get(u.id)).find(Boolean);
    let name = group.find((u) => u.first_name)?.first_name || '';
    if (social) {
      try {
        name = JSON.parse(social.extra_data).name || name;
      } catch {
        /* ignore malformed extra_data */
      }
    }

    const doc = await User.findOneAndUpdate(
      { email },
      {
        $set: { role: isAdmin ? 'admin' : 'customer', ...(social ? { googleId: social.uid } : {}) },
        $setOnInsert: { email, name: name || email.split('@')[0] },
      },
      { upsert: true, new: true }
    );

    if (group.length > 1) {
      report.users.merged.push({ email, usernames: group.map((u) => u.username) });
    }
    group.forEach((u) => usernameToUser.set(u.username, doc));
    report.users.migrated += 1;
  }

  return usernameToUser;
}

async function migrateProducts() {
  const rows = dump.project_product;
  report.products.source = rows.length;
  const nameToId = new Map();

  for (const row of rows) {
    const doc = {
      name: row.Name,
      slug: row.slug,
      productType: mapProductType(row.Product_Type),
      startPrice: row.Start_Price || '',
      startPriceWritten: row.Start_Price_In_Written || '',
      pricePerSqft: Number(row.Price_Per_sqft) || 0,
      seoDescription: row.SEO_description || '',
      seoKeywords: row.SEO_keywords || '',
      images: {
        main: uploadUrl(row.Image),
        pic1: uploadUrl(row.pic1),
        pic2: uploadUrl(row.pic2),
        pic3: uploadUrl(row.pic3),
        pic4: uploadUrl(row.pic4),
        pic5: uploadUrl(row.pic5),
        pic6: uploadUrl(row.pic6),
        pic7: uploadUrl(row.pic7),
        pic8: uploadUrl(row.pic8),
        pic9: uploadUrl(row.pic9),
        pic10: uploadUrl(row.pic10),
      },
    };
    // Bypass Mongoose's pre-save slug-regeneration hook via the raw driver so
    // the ORIGINAL slug (including any random collision suffix) is preserved
    // exactly - regenerating it here would change live product URLs.
    await Product.collection.updateOne({ slug: row.slug }, { $set: doc }, { upsert: true });
    const saved = await Product.findOne({ slug: row.slug });
    nameToId.set(row.Name, saved);
    report.products.migrated += 1;
  }

  return nameToId;
}

async function migrateBlogs() {
  const rows = dump.project_blogger;
  report.blogs.source = rows.length;

  for (const row of rows) {
    const doc = {
      title: row.title,
      slug: row.slug,
      statusArticle: row.Status_article,
      createdOn: new Date(row.created_on),
      thumbnail: uploadUrl(row.thumbnail),
      banner: uploadUrl(row.banner),
      seoDescription: row.SEO_description || '',
      seoKeywords: row.SEO_keywords || '',
      content: row.content || '',
    };
    await Blog.collection.updateOne({ slug: row.slug }, { $set: doc }, { upsert: true });
    report.blogs.migrated += 1;
  }
}

async function migrateContacts() {
  const rows = dump.project_contacts;
  report.contacts.source = rows.length;

  for (const row of rows) {
    await Contact.updateOne(
      { email: row.Email || '', question: row.Question || '' },
      {
        $set: {
          name: row.Name || '',
          email: row.Email || '',
          call: row.Call || '',
          question: row.Question || '',
          source: 'contact',
        },
      },
      { upsert: true }
    );
    report.contacts.migrated += 1;
  }
}

async function migrateOrders(nameToProduct, usernameToUser) {
  const rows = dump.project_order;
  report.orders.source = rows.length;

  for (const row of rows) {
    const product = nameToProduct.get(row.product);
    if (!product) report.orders.unresolvedProduct.push({ slug: row.slug, name: row.product });

    let addon = null;
    if (row.Addon) {
      addon = nameToProduct.get(row.Addon) || null;
      if (!addon) report.orders.unresolvedAddon.push({ slug: row.slug, name: row.Addon });
    }

    const user = usernameToUser.get(row.User);
    if (!user) report.orders.unresolvedUser.push({ slug: row.slug, username: row.User });

    const doc = {
      user: user?._id || null,
      product: product?._id || null,
      addon: addon?._id || null,
      qty: row.QTY,
      length: row.length,
      breadth: row.breadth,
      pricePerSqftSnapshot: product?.pricePerSqft || 0,
      total: row.total,
      gst: row.gst,
      logistic: row.logistic,
      amount: row.Amount,
      statePriceSnapshot: row.State_price,
      address: row.Address || '',
      pincode: row.Pincode || '',
      city: row.City || '',
      state: row.State || '',
      remark: row.Remark || '',
      call: row.Call != null ? String(row.Call) : '',
      email: row.Email || '',
      orderDate: row.Order_Date || '',
      slug: row.slug,
      orderStatus: mapOrderStatus(row.order_status),
      razorpay: {
        orderId: row.razorpay_order_id || '',
        paymentId: row.razorpay_payment_id || '',
        signature: row.razorpay_signature || '',
        isPaid: Boolean(row.is_paid),
      },
    };
    await Order.collection.updateOne({ slug: row.slug }, { $set: doc }, { upsert: true });
    report.orders.migrated += 1;
  }
}

async function migrateDemandOrders(usernameToUser) {
  const rows = dump.project_demand_orders;
  report.demandOrders.source = rows.length;

  for (const row of rows) {
    const user = usernameToUser.get(row.User) || null;
    const doc = {
      user: user?._id || null,
      userLabel: row.User || '',
      amount: row.Amount,
      remark: row.Remark || '',
      call: row.Call != null ? String(row.Call) : '',
      email: row.Email || '',
      orderDate: row.Order_Date || '',
      slug: row.slug,
      razorpay: {
        orderId: row.razorpay_order_id || '',
        paymentId: row.razorpay_payment_id || '',
        signature: row.razorpay_signature || '',
        isPaid: Boolean(row.is_paid),
      },
    };
    await DemandOrder.collection.updateOne({ slug: row.slug }, { $set: doc }, { upsert: true });
    report.demandOrders.migrated += 1;
  }
}

async function main() {
  await connectDB();

  await migrateDeliveryCharges();
  const usernameToUser = await migrateUsers();
  const nameToProduct = await migrateProducts();
  await migrateBlogs();
  await migrateContacts();
  await migrateOrders(nameToProduct, usernameToUser);
  await migrateDemandOrders(usernameToUser);

  console.log('\n=== MIGRATION REPORT ===');
  console.log(JSON.stringify(report, null, 2));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
