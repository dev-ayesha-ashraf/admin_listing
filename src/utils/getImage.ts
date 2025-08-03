const IMAGE_API_URL = import.meta.env.VITE_API2_URL_IMAGE;

export const getImageUrl = (path: string) => {
  if (!path) return "/placeholder-image.jpg";
  if (path.startsWith("http")) return path;
  return `${IMAGE_API_URL}${path}`;
};
