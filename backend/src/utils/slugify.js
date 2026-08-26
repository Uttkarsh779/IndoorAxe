import slugifyLib from 'slugify';
import mongoose from 'mongoose';

function randomString(n) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < n; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Ports project/helpers.py generate_slug(): checks all four slugged
 * collections for a collision (not just the model being saved) and
 * recurses with a random suffix until unique, matching original behavior.
 * Models are resolved lazily via mongoose.model() to avoid circular imports
 * between this util and the model files that call it in their pre-save hooks.
 */
export async function generateUniqueSlug(text) {
  async function attempt(candidateText) {
    const candidate = slugifyLib(candidateText || '', { lower: true, strict: true });
    const [p, b, o, d] = await Promise.all([
      mongoose.model('Product').exists({ slug: candidate }),
      mongoose.model('Blog').exists({ slug: candidate }),
      mongoose.model('Order').exists({ slug: candidate }),
      mongoose.model('DemandOrder').exists({ slug: candidate }),
    ]);
    if (p || b || o || d) {
      return attempt(candidateText + randomString(5));
    }
    return candidate;
  }

  return attempt(text);
}
