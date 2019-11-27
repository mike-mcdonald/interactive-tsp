import { Module } from 'vuex';
import { RootState } from '../types';
import { ProjectState, Project } from './types';

import FeatureLayer from 'esri/layers/FeatureLayer';
import GroupLayer from 'esri/layers/GroupLayer';

import { actions } from './actions';
import { mutations } from './mutations';

const namespaced: boolean = true;

const layers = [
  new GroupLayer({
    id: 'projects-10',
    title: 'Projects, years 1-10',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/22',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/23',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/24'
    ].map(
      url =>
        new FeatureLayer({
          url,
          outFields: ['*'],
          definitionExpression: `estimatedTimeFrame='1-10_YRS'`
        })
    )
  }),
  new GroupLayer({
    id: 'projects-20',
    title: 'Projects, years 11-20',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/22',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/23',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/24'
    ].map(
      url =>
        new FeatureLayer({
          url,
          outFields: ['*'],
          definitionExpression: `estimatedTimeFrame='11-20_YRS'`
        })
    )
  }),
  new GroupLayer({
    id: 'projects-NA',
    title: 'Projects, no timeframe',
    visibilityMode: 'inherited',
    visible: false,
    layers: [
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/22',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/23',
      'https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer/24'
    ].map(
      url =>
        new FeatureLayer({
          url,
          outFields: ['*'],
          definitionExpression: `estimatedTimeFrame='NA'`
        })
    )
  })
];

const state: ProjectState = {
  layers,
  list: new Array<Project>(),
  selected: undefined
};

export default {
  namespaced,
  state,
  actions,
  mutations
} as Module<ProjectState, RootState>;
