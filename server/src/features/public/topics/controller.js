import { getTopicContent, listParentTopics } from './service.js';

// GET /api/topics/parents - parent topics for the home page.
export async function listParents(_req, res) {
  const topics = await listParentTopics();
  res.json({ topics });
}

// GET /api/topics/:slug
// The sidebar (subtopics with their article links) plus the article the topic
// opens on, so one request renders a whole topic page.
export async function getTopic(req, res) {
  const topic = await getTopicContent(req.params.slug);
  res.json(topic);
}
