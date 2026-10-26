import { type ClassValue, clsx } from "clsx";

/**
 * Utility to merge class names.
 * Uses clsx for conditional class joining.
 * Can be extended with tailwind-merge if needed later.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
