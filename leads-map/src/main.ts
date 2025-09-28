import './styles.css';
import leadsRaw from './data/leads.json';
import projectsRaw from './data/projects.json';
import { createMap } from './map/initMap';
import { attachLegend } from './map/legend';
import { addLeadMarkers, addProjectMarkers } from './map/markers';
import { getDurationResults } from './map/distance';
import { leadsSchema, parseData, projectsSchema } from './types/schemas';
import type { Lead, Pair, Project } from './types';

declare global {
  interface Window {
    init: () => void;
  }
}

function ensureEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function buildPairs(leads: Lead[], projects: Project[]): Pair[] {
  const projectIndex = new Map(projects.map((project) => [project.id, project]));

  return leads.map((lead) => {
    const project = projectIndex.get(lead.projectId);
    if (!project) {
      throw new Error(`Lead ${lead.name} references missing project ${lead.projectId}`);
    }

    return {
      origin: { lat: lead.lat, lng: lead.lng },
      destination: { lat: project.lat, lng: project.lng },
      lead,
      proj: project,
    };
  });
}

async function bootstrap(): Promise<void> {
  const leads = parseData(leadsRaw, leadsSchema, 'Lead');
  const projects = parseData(projectsRaw, projectsSchema, 'Project');
  const pairs = buildPairs(leads, projects);

  const container = document.getElementById('map');
  if (!container) {
    throw new Error('Map container #map not found');
  }

  const map = createMap(container);
  attachLegend(map);
  addProjectMarkers(map, projects);

  const results = await getDurationResults(pairs, {
    useLiveTraffic: true,
    departOffsetMin: 15,
  });

  addLeadMarkers(map, results);

  const bounds = new google.maps.LatLngBounds();
  results.forEach(({ pair }) => bounds.extend(pair.origin));

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
  }
}

function loadGoogleMaps(): void {
  const apiKey = ensureEnv('VITE_GOOGLE_MAPS_API_KEY');
  const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps-loader]');
  if (existing) {
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly&callback=init`;
  script.async = true;
  script.defer = true;
  script.dataset.googleMapsLoader = 'true';
  document.head.appendChild(script);
}

window.init = (): void => {
  bootstrap().catch((error) => {
    console.error(error);
  });
};

loadGoogleMaps();
