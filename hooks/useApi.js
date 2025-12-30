// Frontend/hooks/useApi.js
import { useState, useCallback } from 'react';
import api, { handleApiError } from '../services/api';

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (apiCall, ...args) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
    setData
  };
};

// Specifieke hooks
export const useProjects = () => {
  const apiHook = useApi();
  
  const fetchProjects = useCallback(async (filters) => {
    return apiHook.execute(api.fetchProjects, filters);
  }, [apiHook]);
  
  return {
    ...apiHook,
    fetchProjects
  };
};

export const useExtraWork = (projectId) => {
  const apiHook = useApi();
  
  const fetchRequests = useCallback(async (filters) => {
    return apiHook.execute(api.fetchExtraWorkRequests, projectId, filters);
  }, [apiHook, projectId]);
  
  const createRequest = useCallback(async (requestData) => {
    return apiHook.execute(api.createExtraWorkRequest, projectId, requestData);
  }, [apiHook, projectId]);
  
  return {
    ...apiHook,
    fetchRequests,
    createRequest
  };
};

export const useQuotes = (projectId) => {
  const apiHook = useApi();
  
  const fetchQuotes = useCallback(async (filters) => {
    return apiHook.execute(api.fetchQuotesForProject, projectId, filters);
  }, [apiHook, projectId]);
  
  const approveQuote = useCallback(async (quoteId, approvalData) => {
    return apiHook.execute(api.approveQuote, quoteId, approvalData);
  }, [apiHook]);
  
  return {
    ...apiHook,
    fetchQuotes,
    approveQuote
  };
};
