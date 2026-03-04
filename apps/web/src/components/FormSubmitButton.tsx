"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  idleLabel: string;
  pendingLabel?: string;
};

export default function FormSubmitButton({ idleLabel, pendingLabel = "Memproses...", disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <button {...props} type="submit" disabled={pending || disabled}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
