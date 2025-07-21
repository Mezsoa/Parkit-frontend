import { bathingSpots } from './bathing_spots';

export interface Parking {
  Name: string;
  ParkingSpaces?: number;
  ParkingCharge?: string;
  Lat?: number;
  Long?: number;
  Id?: number;
  nearestBathingSpot?: string;
}

const APPID = import.meta.env.VITE_GBG_PARK_APPID;

const BASE_URL = 'https://data.goteborg.se/ParkingService/v2.3';

const endpoints = [
  'PublicTollParkings',
  'PrivateTollParkings',
  'PublicTimeParkings'
];

export async function fetchAllParkings(): Promise<Parking[]> {
  const results = await Promise.all(
    endpoints.map(endpoint =>
      fetch(`${BASE_URL}/${endpoint}/${APPID}?format=JSON`).then(res => res.json())
    )
  );
  // Kombinera alla parkeringar till en array
  return results.flat();
}

export function filterParkingsById(parkings: Parking[]): Parking[] {
  const allIds = bathingSpots.flatMap(spot => spot.parkingIds);
  return parkings.filter(p => p.Id && allIds.includes(Number(p.Id)));
}

export async function listNearbyParkings(lat: number, long: number, radius = 1000): Promise<void> {
  const all = await fetchAllParkings();
  const nearby = all.filter(p => p.Lat && p.Long && distance(p.Lat, p.Long, lat, long) < radius);
  console.log(`Parkeringar inom ${radius} meter från (${lat}, ${long}):`);
  nearby.forEach(p => {
    console.log(`Id: ${p.Id}, Namn: ${p.Name}, Avstånd: ${Math.round(distance(p.Lat!, p.Long!, lat, long))}m`);
  });
}

export function filterParkingsNearBathingSpots(parkings: Parking[], maxDistanceMeters = 300): Parking[] {
  return parkings
    .map(parking => {
      let minDist = Infinity;
      let nearest = '';
      bathingSpots.forEach(spot => {
        if (!parking.Lat || !parking.Long) return;
        const d = distance(parking.Lat, parking.Long, spot.lat, spot.long);
        if (d < minDist) {
          minDist = d;
          nearest = spot.name;
        }
      });
      if (minDist < maxDistanceMeters) {
        return { ...parking, nearestBathingSpot: nearest };
      }
      return null;
    })
    .filter(Boolean) as Parking[];
}

function distance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
} 