import { ActionTree } from 'vuex';
import { StreetState, Street } from './types';
import { RootState } from '../types';
import router from '../../router/index';

import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import centroid from '@turf/centroid';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import * as turf from '@turf/helpers';
import axios from 'axios';
import { esriGraphics } from '../utils';

const classificationMaps = new Map<string, Map<string, string>>();

new Map([
  ['transit', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/3'],
  ['traffic', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/4'],
  ['emergency', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/7'],
  ['design', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/10'],
  ['bicycle', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/12'],
  ['pedestrian', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/15'],
  ['freight', 'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/19']
]).forEach(async (url: string, key: string) => {
  const res = await axios.get(url, {
    params: {
      f: 'json'
    }
  });

  if (res.data) {
    const map = new Map<string, string>();
    res.data.drawingInfo.renderer.uniqueValueInfos.map((info: any) => {
      map.set(info.value, info.label);
    });
    classificationMaps.set(key, map);
  }
});

classificationMaps.set(
  'greenscape',
  new Map<string, string>([
    ['Y', 'Yes'],
    ['N', 'No']
  ])
);

function mapClassification(type: string, value?: string): string {
  if (value && classificationMaps.has(type)) {
    const map = classificationMaps.get(type);
    if (map) {
      return map.get(value) || 'N/A';
    }
  }
  return 'NULL';
}

export const actions: ActionTree<StreetState, RootState> = {
  findStreets({ commit, rootState }, extent) {
    const { xmin, ymin, xmax, ymax } = extent;
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { streets?: Street[] } }>(rootState.graphql_url, {
        params: {
          query: `{
          streets(bbox:[${xmin},${ymin},${xmax},${ymax}], spatialReference:${extent.spatialReference.wkid}){
            id
            name
            block
            geometry {
              type
              coordinates
            }
          }
        }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'Zoom in or search for an address to see available streets...', { root: true });
        }
        if (res.data.data.streets) {
          commit('clearStreets');
          // sort by name then block number
          let streets = res.data.data.streets.sort(function(a, b) {
            var nameA = a.name?.toUpperCase(); // ignore upper and lowercase
            var nameB = b.name?.toUpperCase(); // ignore upper and lowercase

            if (!nameA || !nameB) {
              return Number.MAX_SAFE_INTEGER;
            }
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // names must be equal
            return (a.block || Number.MAX_SAFE_INTEGER) - (b.block || Number.MIN_SAFE_INTEGER);
          });
          streets = streets.map(street => {
            const [minx, miny, maxx, maxy] = bbox(street.geometry);
            street.minX = minx;
            street.minY = miny;
            street.maxX = maxx;
            street.maxY = maxy;
            return street;
          });
          commit('addStreets', streets);
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving streets!', { root: true });
      });
  },
  routeStreetByRTree({ dispatch, state }, bbox: turf.BBox) {
    if (!state.rtree) {
      return undefined;
    }
    // find nearest street
    // buffer point by X meters
    let streets = state.rtree.search({
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3]
    });
    if (streets.length > 0) {
      const center = centroid(bboxPolygon(bbox));
      streets = streets.sort((a, b) => {
        if (!a.geometry || !b.geometry) {
          return Number.MAX_SAFE_INTEGER;
        }

        const nearestA = nearestPointOnLine(a.geometry, center, { units: 'meters' });
        const nearestB = nearestPointOnLine(b.geometry, center, { units: 'meters' });

        if (!nearestA.properties || !nearestB.properties) {
          return Number.MAX_SAFE_INTEGER;
        }

        return nearestA.properties.dist - nearestB.properties.dist;
      });
      router.push({ name: 'streets', params: { id: streets[0].id } });
      dispatch('selectStreetById', streets[0].id);
    }
  },
  selectStreetById({ commit, dispatch, state }, id: string) {
    commit('setMessage', undefined, { root: true });
    let street: Street = { id };

    if (state.list) {
      street = Object.assign(
        street,
        state.list.find(street => {
          return street.id === id;
        })
      );
    }
    commit('setSelectedStreet', street);

    dispatch('selectStreet', street);
  },
  selectStreet({ commit, dispatch, rootState }, street: Street) {
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { street?: Street } }>(rootState.graphql_url, {
        params: {
          query: `{
          street(id:"${street ? street.id : ''}"){
            id
            ${street.name ? '' : 'name'}
            ${street.block ? '' : 'block'}
            ${street.geometry ? '' : `geometry{ type coordinates }`}
            ${
              street.classifications
                ? ''
                : `classifications {
              pedestrian
              bicycle
              transit
              freight
              design
              emergency
              traffic
              greenscape
            }`
            }
            ${
              street.projects
                ? ''
                : `projects {
              id
              name
              number
              description
              estimatedCost
              estimatedTimeframe
            }`
            }
          }
        }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'Some data may contain errors...', { root: true });
        }
        let data = res.data.data;
        if (data.street) {
          data.street = Object.assign(data.street, street);
          if (data.street.classifications) {
            for (const key of Object.keys(data.street.classifications)) {
              data.street.classifications[key] = mapClassification(key, data.street.classifications[key]);
            }
          }
          commit('setSelectedStreet', data.street);
          dispatch('highlightStreet', data.street);
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving the selected street!', { root: true });
      });
  },
  highlightStreet({ commit }, street: Street) {
    if (street.geometry) {
      commit('map/setGraphics', esriGraphics(street.geometry), { root: true });
    }
  }
};
