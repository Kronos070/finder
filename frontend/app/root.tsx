import { 
  Outlet, 
  useMatches, 
  ScrollRestoration, 
  Links, 
  Meta, 
  Scripts,
  useRouteError
} from "react-router";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./lib/queryClient";
import { MantineProvider } from "@mantine/core";
import "./app.css"
import '@mantine/core/styles.css';
import NotFound from "./routes/$";

export function Layout({ children }: { children: React.ReactNode }) {
  const client = getQueryClient();
  const matches = useMatches();
  const dehydratedState = matches.find((m) => m.data?.dehydratedState)?.data?.dehydratedState;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={client}>
          <HydrationBoundary state={dehydratedState}>
            {children}
          </HydrationBoundary>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Провайдер должен быть здесь, чтобы хуки работали корректно
export default function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <Outlet />
    </MantineProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  // ... логика обработки ошибок остается прежней

  return (
    <MantineProvider defaultColorScheme="auto">
      <NotFound />
    </MantineProvider>
  );
}