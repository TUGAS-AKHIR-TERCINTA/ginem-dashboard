import { describe, expect, it } from "vitest";
import { queryKeys } from "./query-keys";

describe("queryKeys", () => {
  it("builds stable get keys", () => {
    expect(queryKeys.get("/stats")).toEqual(["api", "get", "/stats"]);
  });

  it("builds table keys with pagination params", () => {
    const params = { page: 1, size: 10, filterKey: '{"search":"foo"}' };

    expect(queryKeys.table("/devices", params)).toEqual([
      "api",
      "table",
      "/devices",
      params,
    ]);
  });

  it("builds table root keys for invalidation", () => {
    expect(queryKeys.tableRoot("/devices")).toEqual([
      "api",
      "table",
      "/devices",
    ]);
  });
});
