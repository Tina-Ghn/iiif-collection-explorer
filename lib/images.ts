export function getDisplayImageUrl(imageService: string): string {
  return `${imageService}/full/500,/0/default.jpg`;
}

export function getProxiedImageUrl(url: string): string {
  return `/api/image?url=${encodeURIComponent(url)}`;
}
