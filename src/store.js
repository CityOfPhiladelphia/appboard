import Vue from 'vue';
import Vuex from 'vuex';
import isMobileDevice from './util/is-mobile-device';

// when you load vuex from a script tag this seems to happen automatically
Vue.use(Vuex);

// this grabs horizontal table ids from an array of topic components,
// recursively
function getHorizontalTableIdsFromComps(comps = []) {
  // console.log('getHorizontalTableIdsFromComps is running, comps:', comps);

  let tableIds = [];

  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.components || options.tables;

    // if this is a "group" component, recurse
    if (innerComps) {
      const innerTableIds = getHorizontalTableIdsFromComps(innerComps);
      tableIds = tableIds.concat(innerTableIds);
      continue;
    }

    // skip comps that aren't horizontal tables
    if (comp.type !== 'horizontal-table') {
      continue;
    }

    const tableId = comp._id;

    tableIds.push(tableId);
  }

  return tableIds;
}

// this makes the empty filtered data object given a list of topics.
function createFilteredData(config) {
  const topics = config.topics;
  let tableIds = [];

  for (let topic of topics) {
    const comps = topic.components;
    const compTableIds = getHorizontalTableIdsFromComps(comps);
    tableIds = tableIds.concat(compTableIds);
  }

  console.log('createFilteredData is running, tableIds:', tableIds);

  // const filteredData = tableIds.reduce((acc, tableId) => {
  //   acc[tableId] = [];
  //   return acc;
  // }, {});

  let filteredData = {}
  for (let index=0; index < tableIds.length; index++) {
    filteredData[tableIds[index]] = [];
  }

  return filteredData;
}

// this grabs table group ids from an array of topic components
function getHorizontalTableGroupIdsFromComps(comps = []) {
  // console.log('getHorizontalTableGroupIdsFromComps is running, comps:', comps);
  let tableGroupId;

  for (let comp of comps) {
    const options = comp.options || {};
    const innerComps = options.components || options.tables;

    // console.log('getHorizontalTableGroupIdsFromComps, comp:', comp);

    // if this is a "group" component, recurse
    if (!innerComps) {
      continue;
    }

    // console.log('getTableGroupIdsFromComps, comp.type:', comp.type);

    // skip comps that aren't horizontal tables
    if (comp.type !== 'horizontal-table-group') {
      continue;
    }

    tableGroupId = comp._id;
    // console.log('getHorizontalTableGroupIdsFromComps, tableGroupId:', tableGroupId);
  }

  return tableGroupId;
}

// this makes the empty horizontalTableGroups object given a list of topics.
function createHorizontalTableGroups(config) {
  const topics = config.topics;

  let tableGroupIds = [];

  for (let topic of topics) {
    const comps = topic.components;
    const compTableGroupId = getHorizontalTableGroupIdsFromComps(comps);
    if (compTableGroupId) tableGroupIds.push(compTableGroupId);
  }
  // console.log('createHorizontalTableGroups is running, config:', config, 'tableGroupIds:', tableGroupIds);

  let horizontalTableGroups = {};

  for (let tableGroupId of tableGroupIds) {
    horizontalTableGroups[tableGroupId] = {
      activeTable: null,
      activeTableId: null
    };
  }
  return horizontalTableGroups;
}

function createStore(config) {
  // create initial state for sources. data key => {}
  const sourceKeys = Object.keys(config.dataSources || {});
  const sources = sourceKeys.reduce((o, key) => {
    let val;
    // if the source has targets, just set it to be an empty object
    if (config.dataSources[key].targets) {
      val = {
        targets: {}
      };
    } else {
      val = {
       // we have to define these here, because vue can't observe properties that
       // are added later.
       status: null,
       secondaryStatus: null,
       data: null
     };
    }

    o[key] = val;

    return o;
  }, {});

  const parcelKeys = Object.keys(config.parcels || {});
  const parcels = parcelKeys.reduce((o, key) => {
    let val;
    if (config.parcels[key].multipleAllowed) {
      val = {
        data: [],
        status: null,
        activeParcel: null,
        activeAddress: null,
        activeMapreg: null
      };
    } else {
      val = null;
    }

    o[key] = val;

    return o;
  }, {});

  const initialState = {
    isMobileOrTablet: isMobileDevice(),

    // this gets set to the parcel layer for the default (aka first) topic in
    // DataManager.resetGeocode, which is called by Router.hashChanged on app
    // load.
    activeTopic: '',
    activeParcelLayer: '',

    // the ais feature
    clickCoords: null,
    geocode: {
      status: null,
      data: null,
      input: null,
      related: null,
    },
    lastSearchMethod: 'geocode',
    shouldShowAddressCandidateList: false,
    candidates: [],
    addressEntered: null,
    parcels,
    sources,
    horizontalTables: {
      // table id => filtered rows
      filteredData: createFilteredData(config),
    },
    horizontalTableGroups: createHorizontalTableGroups(config),
    activeFeature: {
      featureId: null,
      tableId: null
    }
  };

  // TODO standardize how payloads are passed around/handled
  return new Vuex.Store({
    state: initialState,
    getters: {
      visibleTableIds(state) {
        // get active topic
        const activeTopic = state.activeTopic;

        if (!activeTopic) {
          return [];
        }

        // get horizontal table ids for that topic
        const activeTopicConfig = (config.topics.filter(topic => topic.key === activeTopic) || [])[0];
        const comps = activeTopicConfig.components;

        const compTableGroup = getHorizontalTableGroupIdsFromComps(comps);
        if (compTableGroup) {
          // even though there is only 1 value, it has to be in array form in the state
          const array = [];
          array.push(state.horizontalTableGroups[compTableGroup].activeTableId);
          return array;
        } else {
          const compTables = getHorizontalTableIdsFromComps(comps);
          return compTables;
        }
      }
    },
    mutations: {
      setIsMobileOrTablet(state, payload) {
        state.isMobileOrTablet = payload;
      },
      setHorizontalTableGroupActiveTable(state, payload) {
        // console.log('setHorizontalTableGroupActiveTable, payload:', payload);
        state.horizontalTableGroups[payload.tableGroupId].activeTableId = payload.activeTableId;
        state.horizontalTableGroups[payload.tableGroupId].activeTable = payload.activeTable;
      },
      setHorizontalTableFilteredData(state, payload) {
        const { tableId, data } = payload;

        // check for not-null table id
        if (!tableId) return;

        state.horizontalTables.filteredData[tableId] = data;
      },
      setActiveTopic(state, payload) {
        state.activeTopic = payload;
      },
      setActiveParcelLayer(state, payload) {
        state.activeParcelLayer = payload;
      },
      setSourceStatus(state, payload) {
        const key = payload.key;
        const status = payload.status;

        // if a target id was passed in, set the status for that target
        const targetId = payload.targetId;

        if (targetId) {
          state.sources[key].targets[targetId].status = status;
        } else {
          state.sources[key].status = status;
        }
      },
      setSecondarySourceStatus(state, payload) {
        const key = payload.key;
        const secondaryStatus = payload.secondaryStatus;

        // if a target id was passed in, set the status for that target
        const targetId = payload.targetId;

        // if (targetId) {
        //   state.sources[key].targets[targetId].status = status;
        // } else {
        state.sources[key].secondaryStatus = secondaryStatus;
        // }
      },
      setSourceData(state, payload) {
        // console.log('store setSourceData payload:', payload);
        const key = payload.key;
        const data = payload.data;

        // if a target id was passed in, set the data object for that target
        const targetId = payload.targetId;

        if (targetId) {
          if (state.sources[key].targets[targetId]) {
            state.sources[key].targets[targetId].data = data;
          }
        } else {
          state.sources[key].data = data;
        }
      },
      setSourceDataMore(state, payload) {
        const key = payload.key;
        const data = payload.data;
        const nextPage = payload.page;
        const oldData = state.sources[key].data;
        // console.log('oldData features', oldData.features, 'data features', data.features);
        const allData = oldData.features.concat(data.features);
        // console.log('allData', allData);
        // if a target id was passed in, set the data object for that target
        // const targetId = payload.targetId;

        // if (targetId) {
        //   state.sources[key].targets[targetId].data = data;
        // } else {

        state.sources[key].data.features = allData;
        state.sources[key].data.page = nextPage;
        // }
      },
      // setMapFilters(state, payload) {
      //   state.map.filters = payload;
      // },
      // this sets empty targets for a data source
      createEmptySourceTargets(state, payload) {
        const {key, targetIds} = payload;
        state.sources[key].targets = targetIds.reduce((acc, targetId) => {
          acc[targetId] = {
            status: null,
            data: null
          };
          return acc;
        }, {});
      },
      clearSourceTargets(state, payload) {
        const key = payload.key;
        state.sources[key].targets = {};
      },
      // setMap(state, payload) {
      //   state.map.map = payload.map;
      // },
      // this is the map center as an xy coordinate array (not latlng)
      // setMapCenter(state, payload) {
      //   state.map.center = payload;
      // },
      // setMapZoom(state, payload) {
      //   state.map.zoom = payload;
      // },
      // setMapBounds(state, payload) {
      //   // const { northEast, southWest } = payload || {};
      //   // state.map.bounds.northEast = northEast;
      //   // state.map.bounds.southWest = southWest;
      //   state.map.bounds = payload;
      // },
      // setMapBoundsBasedOnShape(state, payload) {
      //   state.map.boundsBasedOnShape = payload
      // },
      setParcelData(state, payload) {
        // console.log('store setParcelData payload:', payload);
        const { parcelLayer, data, multipleAllowed, status, activeParcel, activeAddress, activeMapreg } = payload || {};
        // console.log('store setParcelData parcelLayer:', parcelLayer, 'data:', data, 'multipleAllowed:', multipleAllowed, 'status:', status, 'activeParcel:', activeParcel);
        if (!multipleAllowed) {
          state.parcels[parcelLayer] = data;
        } else {
          state.parcels[parcelLayer].data = data;
          state.parcels[parcelLayer].status = status;
          state.parcels[parcelLayer].activeParcel = activeParcel;
          state.parcels[parcelLayer].activeAddress = activeAddress;
          state.parcels[parcelLayer].activeMapreg = activeMapreg;
        }
      },
      setActiveParcel(state, payload) {
        console.log('store setActiveParcel:', payload)
        const { parcelLayer, activeParcel, activeAddress, activeMapreg } = payload || {};
        state.parcels[parcelLayer].activeParcel = activeParcel;
        state.parcels[parcelLayer].activeAddress = activeAddress;
        state.parcels[parcelLayer].activeMapreg = activeMapreg;
      },
      // setDorParcelData(state, payload) {
      //   state.dorParcels.data = payload;
      //   // state.parcels.dor.data = payload;
      // },
      // setDorParcelStatus(state, payload) {
      //   state.dorParcels.status = payload;
      //   // state.parcels.dor.status = payload;
      // },
      // setActiveDorParcel(state, payload) {
      //   state.activeDorParcel = payload;
      //   // state.parcels.dor.activeParcel = payload;
      // },
      // setActiveDorAddress(state, payload) {
      //   state.activeDorAddress = payload;
      //   // state.parcels.dor.activeAddress = payload;
      // },
      // setActiveDorMapreg(state, payload) {
      //   state.activeDorMapreg = payload;
      //   // state.parcels.dor.activeMapreg = payload;
      // },
      // setPwdParcel(state, payload) {
      //   state.pwdParcel = payload;
      //   // state.parcels.pwd = payload;
      // },
      setGeocodeStatus(state, payload) {
        state.geocode.status = payload;
      },
      setGeocodeData(state, payload) {
        state.geocode.data = payload;
      },
      setGeocodeRelated(state, payload) {
        state.geocode.related = payload;
      },
      setGeocodeInput(state, payload) {
        state.geocode.input = payload;
      },
      // setBasemap(state, payload) {
      //   state.map.basemap = payload;
      // },
      // setImagery(state, payload) {
      //   state.map.imagery = payload;
      // },
      // setShouldShowImagery(state, payload) {
      //   state.map.shouldShowImagery = payload;
      // },
      setActiveFeature(state, payload) {
        // console.log('store setActiveFeature is running');
        const { featureId, tableId } = payload || {};
        const nextActiveFeature = { featureId, tableId };
        state.activeFeature = nextActiveFeature;
      },
      setLastSearchMethod(state, payload) {
        state.lastSearchMethod = payload;
      },
      setShouldShowAddressCandidateList(state, payload) {
        state.shouldShowAddressCandidateList = payload;
      },
      setCandidates(state, payload) {
        state.candidates = payload;
      },
      setAddressEntered(state, payload) {
        state.addressEntered = payload;
      }
    }
  });
}

export default createStore;
