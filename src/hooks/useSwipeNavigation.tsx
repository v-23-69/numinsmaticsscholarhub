import { useNavigate, useLocation } from "react-router-dom";
import { useCallback, useRef } from "react";

const PAGES = ["/", "/marketplace", "/authenticate", "/profile"];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const currentIndex = PAGES.indexOf(location.pathname);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = Math.abs(touchStartY.current - touchEndY.current);
    
    // Only trigger if horizontal swipe is dominant and significant
    if (Math.abs(deltaX) > 80 && deltaY < 100) {
      if (currentIndex === -1) return;

      if (deltaX > 0) {
        // Swipe left - go to next page
        const nextIndex = (currentIndex + 1) % PAGES.length;
        navigate(PAGES[nextIndex]);
      } else {
        // Swipe right - go to previous page
        const prevIndex = (currentIndex - 1 + PAGES.length) % PAGES.length;
        navigate(PAGES[prevIndex]);
      }
    }
  }, [currentIndex, navigate]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    currentPageIndex: currentIndex,
    pages: PAGES,
  };
}
