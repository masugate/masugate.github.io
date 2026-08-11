"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const motionQuery = "(prefers-reduced-motion: reduce)";
const revealSelector = [
  ".masugate-main > section",
  ".masugate-main > article",
  ".masugate-page-hero",
  ".masugate-footer",
].join(",");

function subscribe(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(motionQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function SiteMotion() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".masugate-site");
    if (!root) return;

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(revealSelector),
    );

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      root.dataset.motion = "reduced";
      targets.forEach((target) => {
        delete target.dataset.motionSection;
        delete target.dataset.motionVisible;
      });
      return;
    }

    root.dataset.motion = "enhanced";
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.dataset.motionVisible = "true";
          observer.unobserve(target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.06,
      },
    );

    targets.forEach((target, index) => {
      target.dataset.motionSection = "true";
      if (
        index === 0 ||
        target.getBoundingClientRect().top < window.innerHeight * 0.86
      ) {
        target.dataset.motionVisible = "true";
        return;
      }
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [pathname, reducedMotion]);

  return null;
}
