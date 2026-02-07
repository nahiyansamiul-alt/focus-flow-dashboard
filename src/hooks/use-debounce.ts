import { useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved';

export function useDebounce<T>(value: T, delay: number, callback: (value: T) => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback(value);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, callback]);
}

export function useDebounceWithStatus<T>(
  value: T, 
  delay: number, 
  callback: (value: T) => void,
  initialValue: T
): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChangedRef = useRef(false);

  useEffect(() => {
    // Check if value has changed from initial
    if (value !== initialValue) {
      hasChangedRef.current = true;
    }

    // Only show saving status if value has actually changed
    if (!hasChangedRef.current) return;

    setStatus('saving');

    // Clear previous timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }

    // Set debounce timeout
    timeoutRef.current = setTimeout(() => {
      callback(value);
      setStatus('saved');
      
      // Reset to idle after showing "saved"
      savedTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
      }, 2000);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, callback, initialValue]);

  // Cleanup saved timeout on unmount
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  return status;
}
