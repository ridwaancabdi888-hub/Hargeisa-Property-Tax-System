import { describe, expect, it } from "vitest";
import { createLatestRequestTracker } from "./latestRequest";

describe("createLatestRequestTracker", () => {
  it("accepts the newest request and rejects an older request", () => {
    const tracker = createLatestRequestTracker();
    const isFirstCurrent = tracker.begin();
    const isSecondCurrent = tracker.begin();

    expect(isFirstCurrent()).toBe(false);
    expect(isSecondCurrent()).toBe(true);
  });

  it("invalidates an active request when the consumer is disposed", () => {
    const tracker = createLatestRequestTracker();
    const isCurrent = tracker.begin();

    tracker.invalidate();

    expect(isCurrent()).toBe(false);
  });

  it("allows a new request after invalidation", () => {
    const tracker = createLatestRequestTracker();
    const staleRequest = tracker.begin();
    tracker.invalidate();
    const newRequest = tracker.begin();

    expect(staleRequest()).toBe(false);
    expect(newRequest()).toBe(true);
  });
});
