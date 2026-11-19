import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createResumeApi,
  deleteResumeApi,
  getResumeApi,
  listResumesApi,
  retryResumeApi,
} from '../api/resume.js';

const LIST_KEY = ['resume-analyses'];

function analysisKey(id) {
  return ['resume-analysis', id];
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
