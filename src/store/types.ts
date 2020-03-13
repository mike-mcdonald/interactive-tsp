import { MapState } from './map/types';

export interface Message {
  id: string;
  type: 'error' | 'warning' | 'info';
  text: string;
}

export interface RootState {
  messages?: Array<Message>;
  graphqlUrl: string;
  map?: MapState;
}
