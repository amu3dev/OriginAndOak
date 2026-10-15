"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(", ");

/**
 * Modal dialog behaviour while `active`: moves focus into the dialog, keeps Tab
 * inside it, closes on Escape, locks page scroll, and returns focus to whatever
 * opened it once it deactivates.
 */
export function useDialogFocus(
  dialogRef: RefObject<HTMLElement | null>,
  {
    active,
    onClose,
    initialFocusRef,
  }: {
    active: boolean;
    onClose: () => void;
    initialFocusRef?: RefObject<HTMLElement | null>;
  }
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;

    const returnFocusTo = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    (initialFocusRef?.current ?? dialogRef.current)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (!dialog.contains(current)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (returnFocusTo && document.contains(returnFocusTo)) {
        returnFocusTo.focus();
      }
    };
  }, [active, dialogRef, initialFocusRef]);
}
