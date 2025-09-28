import type { MatrixElement, Pair, Result } from '../types';

export function colorForMins(minutes: number): string {
  if (minutes <= 30) return '#2ecc71';
  if (minutes <= 60) return '#f1c40f';
  if (minutes <= 90) return '#e67e22';
  return '#e74c3c';
}

export function metersToMiles(meters: number): string {
  return (meters / 1609.344).toFixed(1);
}

export function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

type DistanceOptions = {
  useLiveTraffic: boolean;
  departOffsetMin: number;
};

export async function getDurationResults(
  pairs: Pair[],
  { useLiveTraffic, departOffsetMin }: DistanceOptions,
): Promise<Result[]> {
  const service = new google.maps.DistanceMatrixService();
  const batches = chunk(pairs, 25);
  const results: Result[] = [];

  for (const batch of batches) {
    if (batch.length === 0) continue;

    const request: google.maps.DistanceMatrixRequest = {
      origins: batch.map((item) => item.origin),
      destinations: batch.map((item) => item.destination),
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    };

    if (useLiveTraffic) {
      request.drivingOptions = {
        departureTime: new Date(Date.now() + departOffsetMin * 60_000),
        trafficModel: google.maps.TrafficModel.BEST_GUESS,
      };
    }

    // eslint-disable-next-line no-await-in-loop
    const response = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
      service.getDistanceMatrix(request, (matrix, status) => {
        if (status === 'OK' && matrix) {
          resolve(matrix);
          return;
        }
        reject(new Error(`DistanceMatrixService failed: ${status}`));
      });
    });

    response.rows.forEach((row, index) => {
      const element = row.elements?.[index];
      const currentPair = batch[index];
      if (!element || !currentPair || element.status !== 'OK') {
        return;
      }

      const matrixElement: MatrixElement = {
        status: element.status,
        distanceMeters: element.distance?.value ?? 0,
        durationSec: element.duration?.value ?? 0,
        durationInTrafficSec: element.duration_in_traffic?.value ?? undefined,
      };

      results.push({
        pair: currentPair,
        element: matrixElement,
      });
    });
  }

  return results;
}
