import Topic from '../../models/Topic.js';

export async function listParentTopics() {
  const topics = await Topic.find({ depth: 0 })
    .select('name slug description coverImage sortOrder')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return topics.map((topic) => ({
    id: String(topic._id),
    name: topic.name,
    slug: topic.slug,
    description: topic.description || '',
    coverImage: topic.coverImage || {},
  }));
}