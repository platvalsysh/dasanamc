import { type PropsWithChildren } from "react";
import { useClientOnly } from "./hooks/useClientOnly";

export function ClientOnly({ children }: PropsWithChildren<{}>) {
  const isClient = useClientOnly();

  if (!isClient) return null; // 서버, hydration 전엔 아무 것도 안 보여줌

  return <>{children}</>;
}
