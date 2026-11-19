// URL-safe slugs for topics and articles. Generated once on create and
// kept stable afterwards, so published links do not change silently.
export function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

// Adds -2, -3, ... until the slug is free on that model.
export async function uniqueSlug(Model, base, excludeId = null) {
  const root = slugify(base) || 'item';
  let candidate = root;
  let suffix = 2;

  // Query without operator objects so the global sanitizeFilter setting
  // cannot turn `$ne` into a literal equality value.
  for (;;) {
    const clash = await Model.findOne({ slug: candidate }).select('_id').lean();
    const isSameDocument = clash && excludeId && String(clash._id) === String(excludeId);
    if (!clash || isSameDocument) break;

    candidate = `${root}-${suffix++}`;
    if (suffix > 500) throw new Error('Could not generate a unique slug');
  }

  return candidate;
}
