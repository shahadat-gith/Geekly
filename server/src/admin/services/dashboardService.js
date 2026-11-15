import mongoose from 'mongoose';
import Article from '../../models/Article.js';
import Topic from '../../models/Topic.js';

const MONTHS_BACK = 6;

function monthLabel(date) {
  return date.toLocaleString('en-US', { month: 'short' });
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonths(now) {
  const months = [];
  for (let offset = MONTHS_BACK - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({ key: monthKey(date), label: monthLabel(date), created: 0, published: 0 });
  }
  return months;
}

function countByMonth(documents, field, months) {
  const byKey = new Map(months.map((month) => [month.key, month]));
  for (const doc of documents) {
    const value = doc[field];
    if (!value) continue;
    const bucket = byKey.get(monthKey(new Date(value)));
    if (bucket) bucket[field] += 1;
  }
}

function serializeRecentArticle(article) {
  const topic = article.topics?.find((item) => item && item.name);
  return {
    id: String(article._id),
    title: article.title,
    subtitle: article.subtitle || '',
    status: article.status,
    updatedAt: article.updatedAt,
    publishedAt: article.publishedAt,
    topic: topic
      ? { id: String(topic._id), name: topic.name, slug: topic.slug }
      : null,
    views: article.stats?.views ?? 0,
  };
}

export async function getDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1), 1);

  const [
    statusRows,
    totalTopics,
    newTopicsThisMonth,
    statsRows,
    recentArticleDocs,
    recentTopicDocs,
    createdDocs,
    publishedDocs,
    topicRows,
  ] = await Promise.all([
    Article.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Topic.countDocuments({}),
    // sanitizeFilter is on globally, so operator objects must be trusted.
    Topic.countDocuments({ createdAt: mongoose.trusted({ $gte: startOfMonth }) }),
    Article.aggregate([
      {
        $group: {
          _id: null,
          views: { $sum: '$stats.views' },
          reactions: { $sum: '$stats.reactions' },
          comments: { $sum: '$stats.comments' },
          bookmarks: { $sum: '$stats.bookmarks' },
        },
      },
    ]),
    Article.find()
      .select('-content')
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('topics', 'name slug')
      .lean(),
    Topic.find()
      .select('name slug depth createdAt')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),
    Article.find({ createdAt: mongoose.trusted({ $gte: sixMonthsAgo }) })
      .select('createdAt')
      .lean(),
    Article.find({ publishedAt: mongoose.trusted({ $gte: sixMonthsAgo }) })
      .select('publishedAt')
      .lean(),
    Article.aggregate([
      { $unwind: '$topics' },
      { $group: { _id: '$topics', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: '_id',
          as: 'topic',
        },
      },
      { $unwind: '$topic' },
      { $project: { _id: 0, count: 1, topic: 1 } },
    ]),
  ]);

  const counts = { draft: 0, published: 0, archived: 0 };
  for (const row of statusRows) {
    if (row._id in counts) counts[row._id] = row.count;
  }
  const totalArticles = counts.draft + counts.published + counts.archived;

  const totals = statsRows[0] || { views: 0, reactions: 0, comments: 0, bookmarks: 0 };

  const months = buildMonths(now);
  countByMonth(createdDocs, 'createdAt', months);
  countByMonth(publishedDocs, 'publishedAt', months);

  const publishedThisMonth = publishedDocs.filter(
    (doc) => doc.publishedAt && new Date(doc.publishedAt) >= startOfMonth
  ).length;
  const publishedPrevMonth = publishedDocs.filter((doc) => {
    const at = doc.publishedAt ? new Date(doc.publishedAt) : null;
    return at && at >= startOfPrevMonth && at < startOfMonth;
  }).length;

  return {
    stats: {
      totalArticles,
      publishedArticles: counts.published,
      draftArticles: counts.draft,
      archivedArticles: counts.archived,
      totalTopics,
      newTopicsThisMonth,
      newArticlesThisMonth: createdDocs.filter(
        (doc) => doc.createdAt && new Date(doc.createdAt) >= startOfMonth
      ).length,
      publishedThisMonth,
      publishedPrevMonth,
      totalViews: totals.views,
      totalReactions: totals.reactions,
      totalComments: totals.comments,
      totalBookmarks: totals.bookmarks,
    },
    activity: months,
    statusBreakdown: [
      { status: 'published', label: 'Published', count: counts.published },
      { status: 'draft', label: 'Drafts', count: counts.draft },
      { status: 'archived', label: 'Archived', count: counts.archived },
    ],
    topTopics: topicRows.map((row) => ({
      id: String(row.topic._id),
      name: row.topic.name,
      slug: row.topic.slug,
      depth: row.topic.depth || 0,
      count: row.count,
    })),
    recentArticles: recentArticleDocs.map(serializeRecentArticle),
    recentTopics: recentTopicDocs.map((topic) => ({
      id: String(topic._id),
      name: topic.name,
      slug: topic.slug,
      depth: topic.depth || 0,
      createdAt: topic.createdAt,
    })),
  };
}
