<script lang="ts">
import { onMount, tick } from 'svelte';
import { fetchAllParkings, filterParkingsById } from '$lib/parking';
import type { Parking } from '$lib/parking';
import { listNearbyParkings } from '$lib/parking';

let parkings: Parking[] = [];
let error = '';
let loading = true;
let mapContainer: HTMLDivElement;
let map: any;

listNearbyParkings(57.61427, 11.89197, 1000); // för att hitta nära liggande parkeringar


onMount(async () => {
  try {
    const all = await fetchAllParkings();
    parkings = filterParkingsById(all);
  } catch (e) {
    error = 'Kunde inte hämta parkeringsdata.';
    console.error(e);
  } finally {
    loading = false;
    await tick();
    console.log('mapContainer:', mapContainer);
    console.log('parkings:', parkings);
    if (!error && parkings.length && mapContainer instanceof HTMLDivElement) {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        if (map) map.remove();
        map = L.map(mapContainer).setView([57.65, 11.9], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        parkings.forEach(p => {
          if (p.Lat && p.Long) {
            L.marker([p.Lat, p.Long])
              .addTo(map)
              .bindPopup(`<strong>${p.Name}</strong><br>${p.ParkingSpaces ? p.ParkingSpaces + ' platser' : ''}`);
          }
        });
      } catch (err) {
        error = 'Kunde inte rendera kartan.';
        console.error(err);
      }
    }
  }
});
</script>

{#if loading}
  <p>Laddar parkeringar...</p>
{:else if error}
  <p class="text-red-600">{error}</p>
{:else}
  <div class="mb-4" style="height: 900px; width: 100%; border-radius: 8px; overflow: hidden; margin-top: 2rem;">
    <div bind:this={mapContainer} style="height: 100%; width: 100%; border-radius: 8px; overflow: hidden;"></div>
  </div>
  <ul class="space-y-2">
    {#each parkings as p}
      <li class="border rounded p-2">
        <strong>{p.Name}</strong><br />
        {p.ParkingSpaces ? `${p.ParkingSpaces} platser` : ''}
        {p.ParkingCharge ? `, Taxa: ${p.ParkingCharge}` : ''}
        {p.Lat && p.Long ? `, Koordinater: ${p.Lat}, ${p.Long}` : ''}
        {p.nearestBathingSpot ? `, Närmast: ${p.nearestBathingSpot}` : ''}
      </li>
    {/each}
  </ul>
{/if}

