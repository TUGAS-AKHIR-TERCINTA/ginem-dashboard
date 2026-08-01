import { CONFIGS } from "@/config/env";

export function getImageUrl(path?: string | null): string | null {
  if (!path) return null;

  // If already a full URL, return as-is
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = (CONFIGS.uploadFileUrl || "").replace(/\/$/, "");
  const cleanedPath = path.replace(/^\//, "");

  if (!base) return null;

  return `${base}/${cleanedPath}`;
}
