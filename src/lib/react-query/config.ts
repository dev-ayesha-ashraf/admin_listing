import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // disable automatic refetching on window focus
      retry: 1, // only retry failed requests once
      staleTime: 5 * 60 * 1000, // data is considered fresh for 5 minutes
    },
  },
});
