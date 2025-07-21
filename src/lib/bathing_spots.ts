export interface BathingSpot {
  name: string;
  lat: number;
  long: number;
  parkingIds: number[];
}

export const bathingSpots: BathingSpot[] = [
  { name: 'Näset', lat: 57.6275, long: 11.8992, parkingIds: [90] },
  { name: 'Askimsbadet', lat: 57.61427, long: 11.89197, parkingIds: [] },
  { name: 'Smithska Udden', lat: 57.6872, long: 12.0381, parkingIds: [130] },
]; 