import { Suspense, type ReactNode } from "react";
import { ClientOnly } from "./ClientOnly";

export interface ClientOnlySuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const defaultFallback = (
  <div className="w-full h-5 rounded-md bg-gray-200 animate-pulse" />
);

export function ClientOnlySuspense({
  children,
  fallback = defaultFallback,
}: ClientOnlySuspenseProps) {
  return (
    <ClientOnly>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ClientOnly>
  );
}
