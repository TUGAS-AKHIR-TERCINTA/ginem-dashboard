import moment from "moment";
import { describe, expect, it } from "vitest";
import { convertTime } from "./convertTime";

describe("convertTime", () => {
  it("subtracts 7 hours before formatting", () => {
    const input = "2026-07-06T10:30:00.000Z";
    const expected = moment(input)
      .add(-7, "hours")
      .format("YYYY-MM-DD HH:mm:ss");

    expect(convertTime(input)).toBe(expected);
  });

  it("returns invalid date label for malformed input", () => {
    expect(convertTime("invalid-date")).toBe("Invalid date");
  });
});
