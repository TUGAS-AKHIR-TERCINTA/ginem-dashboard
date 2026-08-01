import { AppProvider } from "@/context/app.context";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>{children}</AppProvider>
    </QueryProvider>
  );
}
