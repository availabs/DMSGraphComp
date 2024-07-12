import React from "react"

import get from "lodash/get"
import set from "lodash/set"
import merge from "lodash/merge"
import isEqual from "lodash/isEqual"

import { format as d3format } from "d3-format"



import {
  SourceSelector,
  ViewSelector,

  GraphTypeSelector,
  GraphOptionsEditor,
  GraphComponent,
  DefaultPalette,

  GraphFilters,

  GraphTypes,

  XAxisSelector,
  YAxisSelector,
  useGetViewData,
  getNewGraphFormat
} from "./components"

const IntFormat = d3format(",d");

const parseJSON = (value) => {
  let json = {}
  try {
    json = JSON.parse(value)
  } catch (e) {
    console.log('no parse')
  }

  return json
}

const getInitialState = value => {
  const { state } = JSON.parse(value || "{}");
  return {
    activeSource: get(state, "activeSource", undefined),
    activeView: get(state, "activeView", undefined),
    activeGraphType: get(state, "activeGraphType", GraphTypes[0]),
    xAxisColumn: get(state, "xAxisColumn", undefined),
    yAxisColumns: get(state, "yAxisColumns", []),
    graphFormat: get(state, "graphFormat", getNewGraphFormat()),
    filters: get(state, "filters", [])
  }
}

const Reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
      case "set-active-source":
        return {
          ...state,
          activeSource: payload.source,
          xAxisColumn: undefined,
          yAxisColumns: []
        }
      case "set-active-view":
        return {
          ...state,
          activeView: payload.view
        }
      case "set-active-graph-type": {
        const nextState = {
          ...state,
          activeGraphType: payload.graph
        }
        if ((payload.graph.type === "Line Graph") && (nextState.graphFormat.colors.type !== "palette")) {
          nextState.graphFormat = {
            ...nextState.graphFormat,
            colors: {
              type: "palette",
              value: [...DefaultPalette]
            }
          }
        }
        return nextState;
      }
      case "set-x-axis-column":
        return {
          ...state,
          xAxisColumn: payload.column
        }
      case "update-x-axis-column": {
        const { update } = payload;
        return {
          ...state,
          xAxisColumn: { ...state.xAxisColumn, ...update }
        }
      }
      case "set-y-axis-columns":
        return {
          ...state,
          yAxisColumns: payload.columns
        }
      case "update-y-axis-column": {
        const { name, update } = payload;
        return {
          ...state,
          yAxisColumns: state.yAxisColumns.map(col => {
            if (col.name === name) {
              return { ...col, ...update };
            }
            return col;
          })
        }
      }
      case "edit-graph-format": {
        const merged = merge({}, state.graphFormat);
        payload.paths.forEach(([path, value]) => {
          set(merged, path, value);
        })
        return {
          ...state,
          graphFormat: merged
        }
      }
      case "add-filter":
        return {
          ...state,
          filters: [...state.filters, payload.filter]
        }
      case "remove-filter":
        return {
          ...state,
          filters: state.filters.filter(f => f !== payload.filter)
        }
    default:
      return state;
  }
}

const EditComp = ({ onChange, value, pgEnv = "hazmit_dama" }) => {

  const [state, dispatch] = React.useReducer(Reducer, value, getInitialState);

  const setActiveSource = React.useCallback(source => {
    dispatch({
      type: "set-active-source",
      source
    })
  }, []);
  const setActiveView = React.useCallback(view => {
    dispatch({
      type: "set-active-view",
      view
    })
  }, []);
  const setActiveGraphType = React.useCallback(graph => {
    dispatch({
      type: "set-active-graph-type",
      graph
    })
  }, []);
  const setXAxisColumn = React.useCallback(column => {
    dispatch({
      type: "set-x-axis-column",
      column
    })
  }, []);
  const updateXAxisColumn = React.useCallback(update => {
    dispatch({
      type: "update-x-axis-column",
      update
    })
  }, []);
  const setYAxisColumns = React.useCallback(columns => {
    dispatch({
      type: "set-y-axis-columns",
      columns
    })
  }, []);
  const updateYAxisColumn = React.useCallback((name, update) => {
    dispatch({
      type: "update-y-axis-column",
      name,
      update
    })
  }, []);

  const editGraphFormat = React.useCallback(paths => {
    dispatch({
      type: "edit-graph-format",
      paths
    })
  }, []);

  const addFilter = React.useCallback(filter => {
    dispatch({
      type: "add-filter",
      filter
    })
  }, []);
  const removeFilter = React.useCallback(filter => {
    dispatch({
      type: "remove-filter",
      filter
    })
  }, []);

  const {
    activeSource,
    activeView,
    activeGraphType,
    xAxisColumn,
    yAxisColumns,
    graphFormat,
    filters
  } = state;

  const columns = React.useMemo(() => {
    return get(state, ["activeSource", "metadata", "value", "columns"]) || [];
  }, [activeSource]);

  const [viewData, viewDataLength] = useGetViewData({ pgEnv, activeView, xAxisColumn, yAxisColumns, filters });

  const dataDomain = React.useMemo(() => {
    return viewData.map(vd => vd.value);
  }, [viewData]);

  const okToSave = React.useMemo(() => {
    const { state: savedState, viewData: savedData } = JSON.parse(value || "{}");
    return Boolean(viewData.length) && (!isEqual(savedState, state) || !isEqual(viewData, savedData));
  }, [state, viewData, value]);

  const doOnChange = React.useCallback(e => {
    if (!okToSave) return;
    onChange(JSON.stringify({ state, viewData }));
  }, [onChange, state, viewData, okToSave]);

  React.useEffect(() => {
    if (okToSave) {
      doOnChange();
    }
  }, [okToSave, doOnChange]);

  return (
    <div className="bg-gray-200 p-4 grid grid-cols-1 gap-2">

      <SourceSelector pgEnv={ pgEnv }
        activeSource={ activeSource }
        setActiveSource={ setActiveSource }/>

      <ViewSelector pgEnv={ pgEnv }
        activeSource={ activeSource }
        setActiveView={ setActiveView }
        activeView={ activeView }/>

      { !activeSource ? null :
        <div>
          <span className="font-bold">Amount of data:</span> { IntFormat(viewDataLength) } rows
        </div>
      }

      <GraphTypeSelector
        activeGraphType={ activeGraphType }
        setActiveGraphType={ setActiveGraphType }/>

      <XAxisSelector columns={ columns }
        xAxisColumn={ xAxisColumn }
        setXAxisColumn={ setXAxisColumn }
        updateXAxisColumn={ updateXAxisColumn }
        activeSource={ activeSource }/>

      <YAxisSelector columns={ columns }
        yAxisColumns={ yAxisColumns }
        setYAxisColumns={ setYAxisColumns }
        updateYAxisColumn={ updateYAxisColumn }
        activeSource={ activeSource }/>

      <GraphComponent
        graphFormat={ graphFormat }
        activeGraphType={ activeGraphType }
        viewData={ viewData }/>

      <GraphFilters
        columns={ columns }
        viewData={ viewData }
        filters={ filters }
        addFilter={ addFilter }
        removeFilter={ removeFilter }
        activeView={ activeView }
        pgEnv={ pgEnv }/>

      <GraphOptionsEditor
        format={ graphFormat }
        edit={ editGraphFormat }
        activeGraphType={ activeGraphType }
        dataDomain={ dataDomain }/>

    </div>
  )
}

const ViewComp = ({ value }) => {

  const { state, viewData } = React.useMemo(() => {
    return JSON.parse(value || "{}");
  }, [value]);

  if (!state) {
    return null;
  }

  const {
    graphFormat,
    activeGraphType
  } = state;

  if (!get(viewData, "length", 0)) {
    return null;
  }

  return (
    <GraphComponent
      graphFormat={ graphFormat }
      activeGraphType={ activeGraphType }
      viewData={ viewData }/>
  )
}

const GraphComp = {
  name: "Graph Component",
  EditComp,
  ViewComp
}
export default GraphComp
