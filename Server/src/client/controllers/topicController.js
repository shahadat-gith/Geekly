import { listParentTopics } from '../services/topicService.js';

export async function listParents(_req, res) {
  const topics = await listParentTopics();
  res.json({ topics });
}