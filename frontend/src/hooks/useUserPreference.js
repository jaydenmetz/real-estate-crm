/**
 * useUserPreference Hook
 *
 * Hybrid localStorage + Database sync for user preferences
 *
 * Features:
 * - Instant reads from localStorage (no loading spinners)
 * - Background sync to database (cross-device)
 * - Debounced writes (don't spam API on every keystroke)
 * - Automatic initialization on first use
 *
 * Usage:
 * const [viewMode, setViewMode] = useUserPreference('escrows.viewMode', 'card');
 */

import { useState, useEffect, useCallback } from 'react';
import { getPreference, setPreference } from '../services/preferences.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Debounce helper
const useDebounce = (callback, delay) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedFn = useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  }, [callback, delay, timeoutId]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedFn;
};

export const useUserPreference = (key, defaultValue) => {
  const queryClient = useQueryClient();

  // 1. Initialize from localStorage (instant, no loading)
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        return stored;
      }
    }
    return defaultValue;
  });

  // 2. Fetch from database in background (syncs across devices)
  const { data: dbValue } = useQuery({
    queryKey: ['preference', key],
    queryFn: () => getPreference(key),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (v5: renamed from cacheTime)
    retry: 1,
    refetchOnMount: false, // Don't refetch if we have cached data
    onSuccess: (data) => {
      if (data !== null && data !== undefined) {
        // Database value exists - sync to localStorage and state
        const extractedValue = data.value !== undefined ? data.value : data;
        localStorage.setItem(key, JSON.stringify(extractedValue));
        setValue(extractedValue);
      }
    },
  });

  // 3. Mutation for updating preference in database
  const mutation = useMutation({
    mutationFn: (newValue) => setPreference(key, newValue),
    onSuccess: () => {
      // Invalidate query to refetch fresh data
      queryClient.invalidateQueries(['preference', key]);
    },
  });

  // 4. Debounced update function (waits 1 second before saving to DB)
  const debouncedSave = useDebounce((newValue) => {
    mutation.mutate(newValue);
  }, 1000);

  // 5. Update function (instant localStorage + debounced API)
  const updateValue = useCallback((newValue) => {
    // Allow function updates like setState
    const resolvedValue = typeof newValue === 'function' ? newValue(value) : newValue;

    // 1. Update state immediately (instant UI feedback)
    setValue(resolvedValue);

    // 2. Save to localStorage immediately (instant persistence)
    localStorage.setItem(key, JSON.stringify(resolvedValue));

    // 3. Save to database after 1 second (debounced - don't spam API)
    debouncedSave(resolvedValue);
  }, [key, value, debouncedSave]);

  return [value, updateValue];
};

export default useUserPreference;
