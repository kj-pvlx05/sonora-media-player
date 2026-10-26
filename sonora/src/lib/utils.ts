import { type ClassValue, clsx } from "clsx";

/**
 * Utility to merge class names.
 * Uses clsx for conditional class joining.
 * Can be extended with tailwind-merge if needed later.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Resolves static asset paths (audio, artwork) with proper basePath support
 * when deployed to GitHub Pages or custom subpaths.
 */
export function getAssetPath(path?: string): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}
