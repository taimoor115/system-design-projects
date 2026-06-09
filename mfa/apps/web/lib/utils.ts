import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getResponseMessage(input: unknown): string | undefined {
  const anyInput = input as any;

  // Axios error (has isAxiosError flag)
  if (anyInput?.isAxiosError) {
    const errors = anyInput?.response?.data?.errors;
    if (Array.isArray(errors) && typeof errors[0] === "string") {
      return errors[0];
    }
    
    const msg = anyInput?.response?.data?.message ?? anyInput?.response?.data?.error ?? anyInput?.message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
    if (msg != null) return String(msg);
    return undefined;
  }

  // Axios response or plain object with data.message
  const candidate = anyInput?.data?.message ?? anyInput?.message;
  if (typeof candidate === "string") return candidate;

  if (typeof input === "string") return input;

  return undefined;
}

export function sanitizeTitle(input: string | null | undefined): string {
  if (!input) return ""

  // Remove HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, "")

  // Try to decode HTML entities when running in browser
  try {
    if (typeof window !== "undefined" && typeof window.document !== "undefined") {
      const el = window.document.createElement("textarea")
      el.innerHTML = withoutTags
      return el.value
    }
  } catch (e) {
    // fallback to plain string
  }

  return withoutTags
}