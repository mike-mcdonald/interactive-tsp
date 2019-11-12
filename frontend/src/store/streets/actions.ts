import { ActionTree } from 'vuex';
import { StreetState, Street, Classification } from './types';
import { RootState } from '../types';

import axios from 'axios';

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
  findStreets({ commit }, extent) {
    const { xmin, ymin, xmax, ymax } = extent;
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { streets?: Street[] } }>('http://localhost:4000/graphql', {
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
          const streets = res.data.data.streets.sort(function(a, b) {
            var nameA = a.name.toUpperCase(); // ignore upper and lowercase
            var nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // names must be equal
            return (a.block || Number.MAX_SAFE_INTEGER) - (b.block || Number.MIN_SAFE_INTEGER);
          });
          streets.forEach((street: Street) => {
            commit('addStreet', street);
          });
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving streets!', { root: true });
      });
  },
  selectStreet({ commit }, id) {
    commit('setMessage', undefined, { root: true });
    axios
      .get<{ errors?: any[]; data: { street?: Street } }>('http://localhost:4000/graphql', {
        params: {
          query: `{
          street(id:"${id}"){
            id
            name
            block
            centroid {
              coordinates
            }
            classifications {
              traffic
              transit
              bicycle
              pedestrian
              freight
              emergency
              design
              greenscape
            }
            projects {
              id
              name
              number
              location
              description
              agency
              estimatedCost
              estimatedTimeframe
              district
              patternArea
              fundingCategory
            }
          }
        }`
        }
      })
      .then(res => {
        if (res.data.errors) {
          commit('setMessage', 'Zoom in or search for an address to see available streets...', { root: true });
        }
        if (res.data.data.street) {
          Object.keys(res.data.data.street.classifications).forEach(c => {
            if (res.data.data.street) {
              res.data.data.street.classifications[c] = mapClassification(c, res.data.data.street.classifications[c]);
            }
          });
          // sort by name then block number
          commit('setSelectedStreet', res.data.data.street);
        }
      })
      .catch(() => {
        commit('setMessage', 'Error retrieving street!', { root: true });
      });
  }
};
