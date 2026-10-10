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
        // Skip toast if explicitly opted out or if it is an unauthenticated 401 error
        if (query.meta?.skipToast === true) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          return;
        }
        notify.fromError(error, "Something went wrong");
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Skip toast if explicitly opted out or if it is an unauthenticated 401 error
        if (mutation.meta?.skipToast === true) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          return;
        }
        notify.fromError(error, "Something went wrong");
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false;
          }
          return failureCount < 1;
        },
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
