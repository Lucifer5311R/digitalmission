import { useState, useCallback } from 'react';
import { ApiResponse } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<{ data: ApiResponse<T> }>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiCall();
      const data = response.data.data as T;
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
