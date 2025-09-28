const DEFAULT_MAP_ID = '6e0ccd1a55446bd922d281f4';

export function createMap(container: HTMLElement): google.maps.Map {
  const mapId = import.meta.env.VITE_MAP_ID || DEFAULT_MAP_ID;

  const map = new google.maps.Map(container, {
    center: { lat: 53.8008, lng: -1.5491 },
    zoom: 7,
    mapId,
  });

  return map;
}
