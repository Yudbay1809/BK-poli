"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { useFormStatus } from "react-dom";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
  idleLabel?: string;
  pendingLabel?: string;
};

export default function ConfirmSubmitButton({
  confirmMessage,
  idleLabel,
  pendingLabel = "Memproses...",
  onClick,
  disabled,
  children,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (pending) return;
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  }

  return (
    <button {...props} disabled={pending || disabled} onClick={handleClick}>
      {pending ? pendingLabel : idleLabel ?? children}
    </button>
  );
}
