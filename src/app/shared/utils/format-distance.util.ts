export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }

  return `${Math.round(distanceKm)}km`;
}
