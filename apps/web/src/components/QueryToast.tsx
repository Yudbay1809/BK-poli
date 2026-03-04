"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ToastType = "success" | "error";

type ToastData = {
  id: number;
  type: ToastType;
  message: string;
  ttlMs: number;
};

export default function QueryToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const seenKeyRef = useRef<string>("");

  const key = useMemo(() => `${pathname}?${searchParams.toString()}`, [pathname, searchParams]);

  useEffect(() => {
    const msg = searchParams.get("msg");
    const err = searchParams.get("err") || searchParams.get("error");

    if (!msg && !err) return;
    if (seenKeyRef.current === key) return;
    seenKeyRef.current = key;

    const next: ToastData[] = [];
    const now = Date.now();
    if (msg) {
      next.push({
        id: now,
        type: "success",
        message: msg,
        ttlMs: 3600,
      });
    }
    if (err) {
      next.push({
        id: now + 1,
        type: "error",
        message: err,
        ttlMs: 5200,
      });
    }

    const enqueueTimer = window.setTimeout(() => {
      setToasts((prev) => [...prev, ...next].slice(-6));
    }, 0);

    return () => window.clearTimeout(enqueueTimer);
  }, [key, pathname, searchParams]);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== toast.id));
      }, toast.ttlMs)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          <div className="toast-content">
            <span>{toast.message}</span>
            <div className="toast-progress-wrap">
              <div className="toast-progress" style={{ animationDuration: `${toast.ttlMs}ms` }} />
            </div>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== toast.id))}
            aria-label="Tutup notifikasi"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
