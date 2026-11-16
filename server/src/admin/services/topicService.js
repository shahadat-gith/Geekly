import mongoose from 'mongoose';
import Topic from '../../models/Topic.js';
import Article from '../../models/Article.js';
import { ApiError } from '../../shared/apiError.js';
import { slugify, uniqueSlug } from '../utils/slug.js';
import { deleteTopicBanner } from '../../config/storage.js';

const MAX_DEPTH = 5;
const NAME_MAX = 120;

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertObjectId(value, message = 'Invalid topic id') {
  if (!mongoose.Types.ObjectId.isValid(value)) throw new ApiError(400, message);
}

// Direct counts plus a rolled-up total for each topic's whole subtree.
function withCounts(documents, counts) {
  const direct = new Map(documents.map((doc) => [doc.id, counts.get(doc.id) ?? 0]));
  const total = new Map(direct);

  for (const doc of documents) {
    const amount = direct.get(doc.id) ?? 0;
    if (!amount) continue;
    for (const ancestorId of doc.ancestors) {
      total.set(ancestorId, (total.get(ancestorId) ?? 0) + amount);
    }
  }

  return { direct, total };
}

function serializeTopic(topic) {
  const id = String(topic._id);
  return {
    id,
    name: topic.name,
    slug: topic.slug,
    description: topic.description || '',
    icon: topic.icon || '',
    coverImage: topic.coverImage || {},
    depth: topic.depth || 0,
    parent: topic.parent ? String(topic.parent) : null,
    ancestors: (topic.ancestors || []).map(String),
    sortOrder: topic.sortOrder || 0,
    articleCount: 0,
    totalArticleCount: 0,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  };
}

function sortTopics(items) {
  return items.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
  );
}

function buildTree(items) {
  const map = new Map(items.map((item) => [item.id, { ...item, children: [] }]));
  const roots = [];

  for (const node of map.values()) {
    if (node.parent && map.has(node.parent)) map.get(node.parent).children.push(node);
    else roots.push(node);
  }

  const order = (nodes) => {
    sortTopics(nodes);
    nodes.forEach((node) => order(node.children));
  };
  order(roots);

  return roots;
}

function topicPath(item, nameById) {
  return [...item.ancestors.map((id) => nameById.get(id)).filter(Boolean), item.name].join(' / ');
}

async function directArticleCounts() {
  const rows = await Article.aggregate([
    { $group: { _id: '$topic', count: { $sum: 1 } } },
  ]);
  return new Map(
    rows.filter((row) => row._id).map((row) => [String(row._id), row.count])
  );
}

// Persist direct article counts, which topic deletion and admin summaries read.
export async function recountTopics() {
  const counts = await directArticleCounts();
  const topics = await Topic.find().select('_id articleCount').lean();

  const updates = topics
    .map((topic) => ({
      id: topic._id,
      count: counts.get(String(topic._id)) ?? 0,
      previous: topic.articleCount ?? 0,
    }))
    .filter((item) => item.count !== item.previous);

  if (!updates.length) return;

  await Topic.bulkWrite(
    updates.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { articleCount: item.count } },
      },
    }))
  );
}

export async function listTopics({ search = '' } = {}) {
  const filter = {};

  const term = String(search || '').trim();
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ name: rx }, { slug: rx }, { description: rx }];
  }

  const [documents, counts] = await Promise.all([
    Topic.find(filter).sort({ depth: 1, sortOrder: 1, name: 1 }).lean(),
    directArticleCounts(),
  ]);

  const topics = documents.map(serializeTopic);
  const { direct, total } = withCounts(topics, counts);

  const nameById = new Map(topics.map((topic) => [topic.id, topic.name]));
  for (const topic of topics) {
    topic.articleCount = direct.get(topic.id) ?? 0;
    topic.totalArticleCount = total.get(topic.id) ?? 0;
    topic.path = topicPath(topic, nameById);
  }

  return {
    topics: sortTopics(topics),
    tree: buildTree(topics),
    total: topics.length,
  };
}

async function parentContext(parentId, selfId = null) {
  if (!parentId) return { parent: null, depth: 0, ancestors: [] };

  assertObjectId(parentId, 'Invalid parent topic');
  const parent = await Topic.findById(parentId);
  if (!parent) throw new ApiError(400, 'Parent topic not found');

  if (selfId) {
    const id = String(selfId);
    const isSelf = String(parent._id) === id;
    const isDescendant = (parent.ancestors || []).some((ancestor) => String(ancestor) === id);
    if (isSelf || isDescendant) {
      throw new ApiError(400, 'A topic cannot be placed under itself or its own sub-topic');
    }
  }

  if (parent.depth >= MAX_DEPTH) {
    throw new ApiError(400, `Topics can be nested at most ${MAX_DEPTH} levels deep`);
  }

  return {
    parent: parent._id,
    depth: parent.depth + 1,
    ancestors: [...(parent.ancestors || []), parent._id],
  };
}

async function assertUniqueName(name, parent, excludeId = null) {
  const query = {
    name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    parent: parent || null,
  };
  const clash = await Topic.findOne(query).select('_id').lean();
  const isSameDocument = clash && excludeId && String(clash._id) === String(excludeId);
  if (clash && !isSameDocument) {
    throw new ApiError(409, 'A topic with this name already exists at this level');
  }
}

function cleanCoverImage(value) {
  if (value == null) return undefined;
  return {
    url: String(value.url ?? '').trim().slice(0, 2048),
    key: String(value.key ?? '').trim().slice(0, 512),
  };
}

function cleanName(value) {
  const name = String(value ?? '').trim();
  if (!name) throw new ApiError(400, 'Topic name is required');
  if (name.length > NAME_MAX) throw new ApiError(400, `Topic name must be ${NAME_MAX} characters or fewer`);
  return name;
}

async function getById(id) {
  assertObjectId(id);
  const topic = await Topic.findById(id);
  if (!topic) throw new ApiError(404, 'Topic not found');
  return topic;
}

export async function createTopic(payload = {}) {
  const name = cleanName(payload.name);
  const context = await parentContext(payload.parent);
  await assertUniqueName(name, context.parent);

  const slug = await uniqueSlug(
    Topic,
    payload.slug || slugify(name)
  );
  const description = String(payload.description ?? '').trim().slice(0, 1000);

  const coverImage = context.depth === 0 && (payload.coverImage?.url || payload.coverImage?.key)
    ? cleanCoverImage(payload.coverImage)
    : undefined;
  const topic = await Topic.create({
    name,
    slug,
    description,
    icon: String(payload.icon ?? '').trim(),
    ...(coverImage ? { coverImage } : {}),
    parent: context.parent,
    depth: context.depth,
    ancestors: context.ancestors,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0,
  });

  return serializeTopic(topic);
}

async function cascadeHierarchy(topic) {
  const children = await Topic.find({ parent: topic._id });
  for (const child of children) {
    child.depth = topic.depth + 1;
    child.ancestors = [...topic.ancestors, topic._id];
    await child.save();
    await cascadeHierarchy(child);
  }
}

export async function updateTopic(id, payload = {}) {
  const topic = await getById(id);
  const previousBannerKey = topic.coverImage?.key;

  if (payload.name !== undefined) {
    const name = cleanName(payload.name);
    if (name !== topic.name) {
      await assertUniqueName(name, payload.parent === undefined ? topic.parent : payload.parent, topic._id);
      topic.name = name;

      // Keep the URL slug in step with the edited topic title. Preserve any
      // explicitly submitted slug; otherwise derive a unique slug from name.
      if (payload.slug === undefined) {
        topic.slug = await uniqueSlug(Topic, slugify(name), topic._id);
      }
    }
  }

  if (payload.parent !== undefined) {
    const context = await parentContext(payload.parent, topic._id);
    topic.parent = context.parent;
    topic.depth = context.depth;
    topic.ancestors = context.ancestors;
    if (context.depth > 0) topic.coverImage = undefined;
  }

  if (payload.slug !== undefined) {
    const next = slugify(payload.slug);
    if (next && next !== topic.slug) {
      topic.slug = await uniqueSlug(Topic, next, topic._id);
    }
  }

  if (payload.description !== undefined) {
    topic.description = String(payload.description ?? '').trim().slice(0, 1000);
  }
  if (payload.icon !== undefined) topic.icon = String(payload.icon ?? '').trim();
  if (payload.coverImage !== undefined) {
    if (topic.depth > 0 && payload.coverImage) {
      throw new ApiError(400, 'Banner images can only be set on parent topics');
    }
    topic.coverImage = payload.coverImage?.url || payload.coverImage?.key
      ? cleanCoverImage(payload.coverImage)
      : undefined;
  }
  if (payload.sortOrder !== undefined && Number.isFinite(Number(payload.sortOrder))) {
    topic.sortOrder = Number(payload.sortOrder);
  }

  await topic.save();
  if (payload.parent !== undefined) await cascadeHierarchy(topic);

  const nextBannerKey = topic.coverImage?.key;
  if (previousBannerKey && previousBannerKey !== nextBannerKey) {
    try {
      await deleteTopicBanner(previousBannerKey);
    } catch (error) {
      console.error('Failed to clean up replaced topic banner:', error.message);
    }
  }

  return serializeTopic(topic);
}

export async function deleteTopic(id) {
  const topic = await getById(id);

  const childCount = await Topic.countDocuments({ parent: topic._id });
  if (childCount > 0) {
    throw new ApiError(409, 'This topic has sub-topics. Move or delete them first.');
  }

  const articleCount = await Article.countDocuments({ topic: topic._id });
  if (articleCount > 0) {
    throw new ApiError(409, 'This topic has articles. Move or delete them first.');
  }

  await topic.deleteOne();
  if (topic.coverImage?.key) {
    try {
      await deleteTopicBanner(topic.coverImage.key);
    } catch (error) {
      console.error('Failed to clean up deleted topic banner:', error.message);
    }
  }
  return { id: String(topic._id) };
}
