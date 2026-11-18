import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createResumeApi,
  deleteResumeApi,
  getResumeApi,
  getRoadmapApi,
  listResumesApi,
  retryResumeApi,
  setTopicCompletionApi,
  startRoadmapApi,
} from '../api/resume.js';

const LIST_KEY = ['resume-analyses'];

function analysisKey(id) {
  return ['resume-analysis', id];
}

function roadmapKey(id) {
  return ['resume-analysis', id, 'preparation'];
}

function isWorking(status) {
  return status === 'QUEUED' || status === 'PROCESSING';
}

// Poll only while the server is still working, then stop.
const pollWhileWorking = (query) => (isWorking(query.state.data?.status) ? 3000 : false);

export function useResumeList() {
  return useQuery({ queryKey: LIST_KEY, queryFn: listResumesApi });
}

export function useResume(id) {
  return useQuery({
    queryKey: analysisKey(id),
    queryFn: () => getResumeApi(id),
    enabled: Boolean(id),
    refetchInterval: pollWhileWorking,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResumeApi,
    onSuccess: (analysis) => {
      queryClient.setQueryData(analysisKey(analysis.id), analysis);
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResumeApi,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: analysisKey(id) });
      queryClient.removeQueries({ queryKey: roadmapKey(id) });
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useRetryResume(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => retryResumeApi(id),
    onSuccess: (analysis) => {
      queryClient.setQueryData(analysisKey(id), analysis);
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useRoadmap(id) {
  return useQuery({
    queryKey: roadmapKey(id),
    queryFn: () => getRoadmapApi(id),
    enabled: Boolean(id),
    refetchInterval: pollWhileWorking,
  });
}

export function useStartRoadmap(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startRoadmapApi(id),
    onSuccess: (roadmap) => {
      queryClient.setQueryData(roadmapKey(id), roadmap);
    },
  });
}

export function useToggleTopic(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, completed }) => setTopicCompletionApi(id, topicId, completed),
    onSuccess: (roadmap) => {
      queryClient.setQueryData(roadmapKey(id), roadmap);
    },
  });
}
