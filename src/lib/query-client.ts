import {
  defaultShouldDehydrateQuery,
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Do NOT toast failed queries by default; toast only if meta: { toast: true }
        if (query.meta?.toast !== true) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          return;
        }
        notify.fromError(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Skip toast if mutation handles its own error UI or opted out
        if (
          mutation.meta?.silent === true ||
          mutation.meta?.skipToast === true
        ) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          return;
        }
        const title =
          typeof mutation.meta?.errorTitle === "string"
            ? mutation.meta.errorTitle
            : undefined;
        notify.fromError(error, title);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // No retry on 4xx errors
          if (
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false;
          }
          // Up to 2 retries on network and 5xx
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
