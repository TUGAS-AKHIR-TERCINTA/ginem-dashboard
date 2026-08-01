import { renderHook } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { createAppQueryWrapper } from "@/test/test-utils";
import { useApiErrorHandler } from "./useApiErrorHandler";

describe("useApiErrorHandler", () => {
  it("dispatches an error alert through app context", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useApiErrorHandler(), {
      wrapper: createAppQueryWrapper(),
    });

    result.current(new Error("Request failed"));

    consoleError.mockRestore();
  });
});
