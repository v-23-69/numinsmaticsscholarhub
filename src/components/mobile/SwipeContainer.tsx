import { ReactNode, useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const PAGES = ["/", "/marketplace", "/authenticate", "/profile"];
const SWIPE_THRESHOLD = 50;

interface SwipeContainerProps {
  children: ReactNode;
}

export function SwipeContainer({ children }: SwipeContainerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dragX, setDragX] = useState(0);
  const constraintsRef = useRef(null);

  const currentIndex = PAGES.indexOf(location.pathname);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;

    // Calculate if swipe was significant enough
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      if (currentIndex === -1) return;

      if (offset.x < 0) {
        // Swipe left - go to next page
        const nextIndex = (currentIndex + 1) % PAGES.length;
        navigate(PAGES[nextIndex]);
      } else {
        // Swipe right - go to previous page
        const prevIndex = (currentIndex - 1 + PAGES.length) % PAGES.length;
        navigate(PAGES[prevIndex]);
      }
    }
    setDragX(0);
  };

  return (
    <motion.div
      ref={constraintsRef}
      className="min-h-screen bg-background"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.05}
      onDrag={(_, info) => setDragX(info.offset.x)}
      onDragEnd={handleDragEnd}
      style={{ touchAction: "pan-y" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { duration: 0.1, ease: "easeOut" }
          }}
          exit={{ opacity: 0, x: -10 }}
          className="relative"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
