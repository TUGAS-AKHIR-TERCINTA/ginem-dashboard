import { useCallback } from "react";
import { useAppContext } from "@/context/app.context";

export function useApiErrorHandler() {
  const { setAppAlert } = useAppContext();

  return useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : "Request failed";
      console.error(message);
      setAppAlert({
        isDisplayAlert: true,
        message,
        alertType: "error",
      });
    },
    [setAppAlert],
  );
}
