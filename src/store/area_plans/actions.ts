import { ActionTree } from 'vuex';

import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import axios from 'axios';
import Polygon from 'esri/geometry/Polygon';
import Graphic from 'esri/Graphic';
import GraphicsLayer from 'esri/layers/GraphicsLayer';

import { defaultExtent } from '../map';
import { RootState } from '../types';
import { esriGeometry, esriGraphics } from '../utils';
import { AreaPlan, AreaPlanState } from './types';

export const actions: ActionTree<AreaPlanState, RootState> = {
  async findPlans({ commit, dispatch, state, rootState }) {
    const extent = defaultExtent;

    const { xmin, ymin, xmax, ymax } = extent;

    dispatch('removeMessage', 'area-plans-retrieving', {
      root: true
    });

    dispatch(
      'addMessage',
      { id: 'area-plans-retrieving', type: 'info', text: 'Retrieving area street plans...' },
      {
        root: true
      }
    );

    const res = await axios
      .get<{ errors?: any[]; data: { areaPlans?: AreaPlan[] } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          areaPlans(bbox:[${xmin},${ymin},${xmax},${ymax}], spatialReference:${extent.spatialReference.wkid}){
            id
            name
            description
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
            id: 'area-plans-error-retrieving',
            type: 'error',
            text: 'Error retrieving area plans!',
            dismissible: true
          },
          { root: true }
        );
        throw err;
      });

    dispatch('removeMessage', 'area-plans-retrieving', {
      root: true
    });

    if (res.data.errors) {
      dispatch(
        'addMessage',
        {
          id: 'area-plans-graphql-error',
          type: 'warning',
          text: 'Some data may contain errors...',
          dismissible: true
        },
        { root: true }
      );
    }

    const plans = res.data.data.areaPlans;

    if (plans) commit('setList', plans);
  },
  selectPlan({ commit, dispatch, state, rootState }, plan: AreaPlan) {
    dispatch(
      'addMessage',
      {
        id: 'area-plans-retrieving',
        type: 'info',
        text: `Retrieving area plan ${plan.id}...`
      },
      { root: true }
    );

    commit('setSelected', undefined);

    axios
      .get<{ errors?: any[]; data: { areaPlan?: Array<AreaPlan> } }>(rootState.graphqlUrl, {
        params: {
          query: `{
          areaPlan(id:"${plan ? plan.id : ''}") {
            id
            name
            description
            manager
            adopted
            requirements
            document
            geometry { type coordinates }
          }
        }`.replace(/\s+/g, ' ')
        }
      })
      .then(res => {
        if (res.data.errors) {
          dispatch(
            'addMessage',
            {
              id: 'area-plans-graphql-error',
              type: 'warning',
              text: 'Some data may contain errors...',
              dismissible: true
            },
            { root: true }
          );
        }
        let data = res.data.data;

        if (data.areaPlan) {
          plan = data.areaPlan.find(value => plan.id == value.id)!;
          commit('setSelected', plan);
        }
      })
      .catch(() => {
        dispatch(
          'addMessage',
          {
            id: 'area-plans-error-retrieving',
            type: 'error',
            text: 'Error retrieving the selected plan!',
            dismissible: true
          },
          { root: true }
        );
      });
    dispatch('removeMessage', 'area-plans-retrieving', { root: true });
  },
  async unselectPlan({ state }) {
    const graphicsLayer: GraphicsLayer | undefined = state.layers.find(
      layer => layer.id == 'plan-selection'
    ) as GraphicsLayer;
    graphicsLayer.removeAll();
  },
  async highlightPlan({ commit, dispatch, state }, { plan, move }: { plan: AreaPlan; move: boolean }) {
    let p = plan;

    if (!plan.geometry) {
      if (state.list.length == 0) await dispatch('findPlans');
      p = state.list.find(value => plan.id == value.id)!;
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
