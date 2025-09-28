export interface LatLng {
  lat: number;
  lng: number;
}

export interface Project extends LatLng {
  id: string;
  name: string;
}

export interface Lead extends LatLng {
  id: string;
  name: string;
  projectId: string;
}

export interface Pair {
  origin: LatLng;
  destination: LatLng;
  lead: Lead;
  proj: Project;
}

export interface MatrixElement {
  distanceMeters: number;
  durationSec: number;
  durationInTrafficSec?: number;
  status: string;
}

export interface Result {
  pair: Pair;
  element: MatrixElement;
}
