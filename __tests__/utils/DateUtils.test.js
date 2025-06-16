// __tests__/utils/dateUtils.test.js
import { formatTimeAgo } from "@/lib/dateUtils";

describe("Date Utils", () => {
  it("should format time correctly", () => {
    const mockNow = new Date("2024-01-15T12:00:00Z");
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);

    const date30SecondsAgo = new Date("2024-01-15T11:59:30Z");
    const result = formatTimeAgo(date30SecondsAgo);

    expect(result).toContain("30");

    jest.useRealTimers();
  });
});
