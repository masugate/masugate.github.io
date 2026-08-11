"use client";

import { useEffect, useRef, useState } from "react";

export function useInViewOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (hasEntered) return;

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasEntered(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.08,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasEntered]);

  return { ref, hasEntered };
}
