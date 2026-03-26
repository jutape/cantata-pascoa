export interface ReviewItem {
  id: number;
  repetition: number;
  interval: number;
  efactor: number;
  nextReviewDate: number; // timestamp
}

export function calculateSM2(quality: number, item: ReviewItem): ReviewItem {
  let { repetition, interval, efactor } = item;

  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  // For a script rehearsal, we might want shorter intervals if it's the same day.
  // But let's stick to days for now, or just use minutes for testing.
  // Let's use minutes so the user can see it working immediately.
  // interval is in "minutes" for this app to allow quick rehearsal.
  const nextReviewDate = new Date();
  nextReviewDate.setMinutes(nextReviewDate.getMinutes() + interval);

  return {
    ...item,
    repetition,
    interval,
    efactor,
    nextReviewDate: nextReviewDate.getTime(),
  };
}

export function getInitialReviewItem(id: number): ReviewItem {
  return {
    id,
    repetition: 0,
    interval: 0,
    efactor: 2.5,
    nextReviewDate: 0,
  };
}
