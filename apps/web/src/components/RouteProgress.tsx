"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function isInternalAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest("a");
  if (!anchor) return null;

  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  if (anchor.getAttribute("rel")?.includes("external")) return null;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;

  return anchor;
}

export default function RouteProgress() {
  const pathname = usePathname();

  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const settleTimerRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      settleTimerRef.current = null;
      tickTimerRef.current = null;
      frameRef.current = null;
    };

    const start = () => {
      clearTimers();
      setActive(true);
      setProgress(12);

      tickTimerRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return prev;
          return prev + (90 - prev) * 0.12;
        });
      }, 90);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!isInternalAnchor(event.target)) return;
      start();
    };

    window.addEventListener("click", onClick, { capture: true });
    return () => {
      clearTimers();
      window.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    if (tickTimerRef.current) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      setProgress(100);
      frameRef.current = null;
    });
    settleTimerRef.current = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
      settleTimerRef.current = null;
    }, 230);
  }, [pathname, active]);

  return (
    <div aria-hidden className={`route-progress-wrap ${active ? "is-active" : ""}`}>
      <span className="route-progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}
