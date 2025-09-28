import { colorForMins, metersToMiles } from './distance';
import type { Project, Result } from '../types';

type MarkerLike = google.maps.marker.AdvancedMarkerElement | google.maps.Marker;

export function addProjectMarkers(
  map: google.maps.Map,
  projects: Project[],
): { markers: google.maps.Marker[]; clear: () => void } {
  const markers: google.maps.Marker[] = projects.map(
    (project) =>
      new google.maps.Marker({
        map,
        position: { lat: project.lat, lng: project.lng },
        title: project.name,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 4,
          strokeColor: '#2c3e50',
          fillColor: '#2c3e50',
          fillOpacity: 1,
        },
      }),
  );

  return {
    markers,
    clear() {
      markers.forEach((marker) => marker.setMap(null));
    },
  };
}

export function addLeadMarkers(
  map: google.maps.Map,
  results: Result[],
): { markers: MarkerLike[]; clear: () => void } {
  const markers: MarkerLike[] = [];
  const infoWindow = new google.maps.InfoWindow();
  const markerApi = (google.maps.marker ?? {}) as typeof google.maps.marker;
  const AdvancedMarker = markerApi.AdvancedMarkerElement;
  const PinElement = markerApi.PinElement;

  results.forEach(({ pair, element }) => {
    const seconds = element.durationInTrafficSec ?? element.durationSec;
    const minutes = Math.round(seconds / 60);
    const miles = metersToMiles(element.distanceMeters);
    const title = `${pair.lead.name} → ${pair.proj.name}\n${miles} miles • ${minutes} mins`;
    const infoContent = `
      <div style="font:14px system-ui">
        <strong>${pair.lead.name}</strong><br/>
        Allocated to: ${pair.proj.name}<br/>
        Distance: ${miles} miles<br/>
        Time: ${minutes} mins
      </div>
    `;

    if (AdvancedMarker && PinElement) {
      const pin = new PinElement({
        background: colorForMins(minutes),
        glyph: `${minutes}m`,
      });

      const marker = new AdvancedMarker({
        map,
        position: pair.origin,
        title,
        content: pin.element,
      });

      marker.addListener('click', () => {
        infoWindow.setContent(infoContent);
        infoWindow.open({ anchor: marker, map });
      });

      markers.push(marker);
    } else {
      const marker = new google.maps.Marker({
        map,
        position: pair.origin,
        title,
        label: {
          text: `${minutes}`,
          color: '#fff',
          fontSize: '12px',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: colorForMins(minutes),
          fillOpacity: 1,
          strokeColor: '#34495e',
          strokeOpacity: 0.6,
        },
      });

      marker.addListener('click', () => {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, marker);
      });

      markers.push(marker);
    }
  });

  return {
    markers,
    clear() {
      markers.forEach((marker) => {
        if ('setMap' in marker) {
          (marker as google.maps.Marker).setMap(null);
        } else {
          (marker as google.maps.marker.AdvancedMarkerElement).map = null;
        }
      });
    },
  };
}
