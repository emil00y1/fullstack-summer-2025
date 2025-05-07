// hooks/useInfiniteScroll.js
import { useState, useEffect, useCallback } from "react";

export function useInfiniteScroll(loadMoreCallback, options = {}) {
  const { threshold = 0.8 } = options;
  const [isFetching, setIsFetching] = useState(false);

  // Function to check if we should load more
  const checkScrollPosition = useCallback(() => {
    // Don't trigger if already fetching
    if (isFetching) return;

    // Get scroll info
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Calculate scroll percentage
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // If scrolled past threshold, start fetching
    if (scrollPercentage > threshold) {
      setIsFetching(true);
    }
  }, [isFetching, threshold]);

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener("scroll", checkScrollPosition);
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, [checkScrollPosition]);

  // Call the loadMore callback when isFetching changes to true
  useEffect(() => {
    if (!isFetching) return;

    // Call provided callback and reset fetching state
    const fetchData = async () => {
      await loadMoreCallback();
      setIsFetching(false);
    };

    fetchData();
  }, [isFetching, loadMoreCallback]);

  return { isFetching };
}
