import { QueryClient } from "@tanstack/react-query";

export function createNewQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return createNewQueryClient();
  }

  if (!browserQueryClient) browserQueryClient = createNewQueryClient();
  return browserQueryClient
}