import * as topicService from './service.js';

export async function list(req, res) {
  const result = await topicService.listTopics({
    search: req.query.search,
  });
  res.json(result);
}

export async function create(req, res) {
  const topic = await topicService.createTopic(req.body);
  res.status(201).json({ topic });
}

export async function update(req, res) {
  const topic = await topicService.updateTopic(req.params.id, req.body);
  res.json({ topic });
}

export async function remove(req, res) {
  const result = await topicService.deleteTopic(req.params.id);
  res.json({ message: 'Topic deleted', ...result });
}
