import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { articlesApi, topicsApi } from '../api/index.js';

// The topic page: sidebar outline plus its default article, in one request.
export function useTopic(slug) {
  return useQuery({
    queryKey: ['topic', slug],
    queryFn: () => topicsApi.getTopicApi(slug),
    retry: false,
    enabled: Boolean(slug),
  });
}

// One article, fetched by the id carried by its sidebar link.
export function useArticle(id) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesApi.getArticleApi(id),
    retry: false,
    enabled: Boolean(id),
  });
}

// /topic-slug and /topic-slug/article-slug. Legacy links that still carry a
// subtopic (/topic/subtopic/article) resolve by their last segment.
export function useArticlePath() {
  const segments = useLocation().pathname.split('/').filter(Boolean);

  return {
    topicSlug: segments[0] ?? '',
    articleSlug: segments.length > 1 ? segments[segments.length - 1] : '',
    validPath: segments.length > 0 && segments.length <= 3,
  };
}
