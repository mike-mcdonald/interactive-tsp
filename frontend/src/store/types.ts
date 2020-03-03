import { MapState } from './map/types';

export interface RootState {
  message?: string;
  graphqlUrl: string;
  map?: MapState;
}
