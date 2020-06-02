import { ActionTree } from 'vuex';

import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import axios from 'axios';
import Polygon from 'esri/geometry/Polygon';
import Graphic from 'esri/Graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import GroupLayer from 'esri/layers/GroupLayer';
import Layer from 'esri/layers/Layer';

import { defaultExtent } from '../map';
import { RootState } from '../types';
import { esriGeometry, esriGraphics } from '../utils';
import { MasterStreetPlan, MasterStreetPlanFeature, MasterStreetPlanState } from './types';

const LAYER_URLS = [
  'https://services.arcgis.com/quVN97tn06YNGj9s/ArcGIS/rest/services/Master_Street_Plans/FeatureServer/1',
  'https://services.arcgis.com/quVN97tn06YNGj9s/ArcGIS/rest/services/Master_Street_Plans/FeatureServer/2'
];

export const FEATURE_LAYER_REGEX = /msp-features-(?=points|lines)/;

export const actions: ActionTree<MasterStreetPlanState, RootState> = {
  async findPlans({ commit, dispatch, state, rootState }) {
    const extent = defaultExtent;

    const { xmin, ymin, xmax, ymax } = extent;

    dispatch('removeMessage', 'master-plans-retrieving', {
      root: true
    });

    dispatch(
      'addMessage',
      { id: 'master-plans-retrieving', type: 'info', text: 'Retrieving master street plans...' },
      {
        root: true
      }
    );

    const res = await axios
      .get<{ errors?: any[]; data: { masterStreetPlans?: MasterStreetPlan[] } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          masterStreetPlans(bbox:[${xmin},${ymin},${xmax},${ymax}], spatialReference:${extent.spatialReference.wkid}){
            id
            name
            label
            features {
              name
              label
            }
            geometry {
              type
              coordinates
            }
          }
        }`.replace(/\s+/g, ' ')
        }
      })
      .catch(err => {
        dispatch(
          'addMessage',
          {
            id: 'master-street-plans-error-retrieving',
            type: 'error',
            text: 'Error retrieving master street plans!',
            dismissible: true
          },
          { root: true }
        );
        throw err;
      });

    dispatch('removeMessage', 'master-plans-retrieving', {
      root: true
    });

    if (res.data.errors) {
      dispatch(
        'addMessage',
        {
          id: 'master-street-plans-graphql-error',
          type: 'warning',
          text: 'Some data may contain errors...',
          dismissible: true
        },
        { root: true }
      );
    }

    const plans = res.data.data.masterStreetPlans;

    if (plans) commit('setList', plans);
  },
  selectPlan({ commit, dispatch, state, rootState }, plan: MasterStreetPlan) {
    dispatch(
      'addMessage',
      {
        id: 'master-street-plans-retrieving-street',
        type: 'info',
        text: `Retrieving master street plan ${plan.id}...`
      },
      { root: true }
    );
    commit('setSelected', undefined);

    axios
      .get<{ errors?: any[]; data: { masterStreetPlan?: Array<MasterStreetPlan> } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          masterStreetPlan(id:${plan ? plan.id : ''}) {
            id
            ${plan.name ? '' : 'name'}
            ${plan.label ? '' : 'label'}
            document
            ${plan.geometry ? '' : 'geometry { type coordinates }'}
            features {
              id
              name
              label
            }
          }
        }`.replace(/\s+/g, ' ')
        }
      })
      .then(res => {
        dispatch('clearMessages', undefined, { root: true });
        if (res.data.errors) {
          dispatch(
            'addMessage',
            {
              id: 'streets-graphql-error',
              type: 'warning',
              text: 'Some data may contain errors...',
              dismissible: true
            },
            { root: true }
          );
        }
        let data = res.data.data;

        if (data.masterStreetPlan) {
          plan = data.masterStreetPlan[0];
          plan.features = plan.features?.reduce((prev, curr) => {
            let feature = prev.find(value => value.name == curr.name);
            if (!feature) {
              prev.push({
                name: curr.name,
                label: curr.label,
                count: 1,
                enabled: true,
                layer: new GroupLayer({
                  id: `${curr.name}-features`,
                  title: curr.label,
                  visibilityMode: 'inherited',
                  visible: true,
                  layers: LAYER_URLS.map(url => {
                    return new FeatureLayer({
                      url,
                      outFields: ['*'],
                      definitionExpression: `MSP_Area='${plan.name}' AND MasterStreetPlan='${curr.name}'`
                    });
                  })
                })
              });
            } else {
              feature.count = feature.count + 1;
            }
            return prev;
          }, new Array<MasterStreetPlanFeature>());
          commit('setSelected', plan);
        }
      })
      .catch(() => {
        dispatch(
          'addMessage',
          {
            id: 'master-street-plans-error-retrieving',
            type: 'error',
            text: 'Error retrieving the selected master street plan!',
            dismissible: true
          },
          { root: true }
        );
      });
  },
  async unselectPlan({ state }) {
    state.layers.forEach((layer: Layer, idx: number) => {
      if (FEATURE_LAYER_REGEX.test(layer.id)) {
        layer.visible = false;
      }
    });
  },
  async highlightPlan({ commit, dispatch, state }, { plan, move }: { plan: MasterStreetPlan; move: boolean }) {
    let p = plan;

    if (!plan.geometry) {
      if (state.list.length == 0) await dispatch('findPlans');
      p = state.list.find(value => value.id == plan.id)!;
    }

    if (p.geometry) {
      const graphics = new Array<Graphic>();
      graphics.push(...esriGraphics(p.geometry));
      const graphicsLayer: GraphicsLayer | undefined = state.layers.find(
        layer => layer.id == 'plan-selection'
      ) as GraphicsLayer;
      graphicsLayer.removeAll();
      graphicsLayer.addMany(graphics);

      if (move) {
        const extent = new Polygon(esriGeometry(bboxPolygon(bbox(p.geometry)).geometry));
        commit('map/goTo', extent, { root: true });
      }
    }
  }
};
