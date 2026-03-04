"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function isSameOrigin(url: URL) {
  return url.origin === window.location.origin;
}

export default function GlobalGetFormNavigation() {
  const router = useRouter();

  useEffect(() => {
    function onSubmit(event: Event) {
      const submitEvent = event as SubmitEvent;
      const form = submitEvent.target as HTMLFormElement | null;
      if (!form || form.tagName !== "FORM") return;
      if (form.dataset.noSpa === "true") return;

      const method = (form.method || "get").toLowerCase();
      if (method !== "get") return;
      if (form.target && form.target !== "_self") return;

      const action = form.getAttribute("action") || window.location.pathname;
      const actionUrl = new URL(action, window.location.href);
      if (!isSameOrigin(actionUrl)) return;

      const submitter = submitEvent.submitter as (HTMLButtonElement | HTMLInputElement | null);
      const submitterFormAction = submitter?.getAttribute("formaction");
      const submitUrl = new URL(submitterFormAction || actionUrl.toString(), window.location.href);
      if (!isSameOrigin(submitUrl)) return;

      const formData = new FormData(form);
      if (submitter?.name) {
        formData.append(submitter.name, submitter.value);
      }

      const search = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        if (typeof value !== "string") continue;
        if (value === "") continue;
        search.append(key, value);
      }

      const next = `${submitUrl.pathname}${search.toString() ? `?${search.toString()}` : ""}`;
      const current = `${window.location.pathname}${window.location.search}`;
      if (next === current) return;

      event.preventDefault();
      router.push(next as Parameters<typeof router.push>[0], { scroll: false });
    }

    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [router]);

  return null;
}
