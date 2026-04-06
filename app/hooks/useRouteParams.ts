'use client';

import { useParams } from 'next/navigation';

/**
 * Hook to safely get route parameters in Next.js 15+
 * This is a type-safe wrapper around useParams
 */
export function useRouteParams<T>() {
  const params = useParams() as unknown as T;
  
  if (!params) {
    throw new Error('Route parameters are undefined. This might be due to incorrect route configuration or the page being rendered outside of a route context.');
  }
  
  return params;
} 