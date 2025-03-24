import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";

const retry = (failureCount: number, error: Error) => {
  if (error instanceof Error) {
    if (error.message === "Not Found") {
      return false;
    }
  }
  return failureCount < 3;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retryOnMount: false,
      networkMode: "always", // Always make network requests
      throwOnError: false,
    },
    mutations: {
      retry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Max 10 seconds
      throwOnError: false,
    },
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
