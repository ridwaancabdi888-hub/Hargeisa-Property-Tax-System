import { useEffect, useState } from "react";

export type LatestRequestTracker = {
  begin: () => () => boolean;
  invalidate: () => void;
};

export function createLatestRequestTracker(): LatestRequestTracker {
  let sequence = 0;

  return {
    begin() {
      const request = ++sequence;
      return () => request === sequence;
    },
    invalidate() {
      sequence += 1;
    },
  };
}

export function useLatestRequestTracker() {
  const [tracker] = useState(createLatestRequestTracker);

  useEffect(() => () => tracker.invalidate(), [tracker]);

  return tracker;
}
