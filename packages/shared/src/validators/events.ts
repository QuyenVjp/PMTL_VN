export function validateEventRange(startAt: Date, endAt: Date): boolean {
  return endAt.getTime() >= startAt.getTime();
}

