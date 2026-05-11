export function protectedUploadUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("/api/uploads/")) return path;
  if (path.startsWith("/uploads/")) return `/api${path}`;
  return path.startsWith("/") ? path : `/${path}`;
}

export function privateUploadPathFromUrl(path: string): string {
  return path
    .replace(/^\/api\/uploads\//, "")
    .replace(/^\/uploads\//, "");
}
