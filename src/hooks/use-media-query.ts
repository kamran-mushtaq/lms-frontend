// src/hooks/use-media-query.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design that detects if a media query matches
 * @param query The media query to check (e.g., '(max-width: 768px)')
 * @returns boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for SSR
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Set initial value on component mount
    const media = window.matchMedia(query);
    setMatches(media.matches);

    // Define callback to update state on change
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add event listener for media query changes
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Older browsers
      media.addListener(listener);
    }

    // Cleanup on unmount
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // Older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
