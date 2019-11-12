import * as turf from '@turf/helpers';

export interface Classification {
  traffic?: string;
  transit?: string;
  bicycle?: string;
  pedestrian?: string;
  freight?: string;
  emergency?: string;
  design?: string;
  greenscape?: string;
}

export interface Street {
  id: string;
  name: string;
  block?: number;
  classifications: Classification;
  projects?: Array<string>;
  geometry: turf.LineString;
}

export interface StreetState {
  version: string;
  list?: Street[];
  selected?: Street;
}
