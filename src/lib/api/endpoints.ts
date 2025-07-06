export const API_ENDPOINTS = {
  categories: "/categories",
  attributes: "/attributes",
  listings: "/listings",
  sellers: "/sellers",
} as const;

export type Endpoint = keyof typeof API_ENDPOINTS;
