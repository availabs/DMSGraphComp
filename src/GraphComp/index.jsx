import React from "react"

import get from "lodash/get"
import set from "lodash/set"

import { format as d3format } from "d3-format"



import {
  SourceSelector,
  ViewSelector,

  GraphTypeSelector,
  GraphDataGenerators,
  GraphOptionsEditor,
  GraphComponent,
  DefaultPalette,

  GraphOptions,
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

const InitialState = {
  activeSource: undefined,
  activeView: undefined,
  activeGraphType: GraphOptions[0],
  xAxisColumn: undefined,
  yAxisColumns: [],
  graphFormat: getNewGraphFormat()
}

const getInitialState = (value = "{}") => {
  console.log('value', value, typeof value)
  const parsed = parseJSON(value) || {};
  return {
    activeSource: get(parsed, "activeSource", undefined),
    activeView: get(parsed, "activeView", undefined),
    activeGraphType: get(parsed, "activeGraphType", GraphOptions[0]),
    xAxisColumn: get(parsed, "xAxisColumn", undefined),
    yAxisColumns: get(parsed, "yAxisColumns", []),
    graphFormat: get(parsed, "graphFormat", getNewGraphFormat())
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
        if (payload.graph.type !== "Bar Graph") {
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
      case "edit-graph-format":
        return {
          ...state,
          graphFormat: payload.format
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

  const editGraphFormat = React.useCallback(format => {
    dispatch({
      type: "edit-graph-format",
      format
    })
  }, []);

  const {
    activeSource,
    activeView,
    activeGraphType,
    xAxisColumn,
    yAxisColumns,
    graphFormat
  } = state;

  const columns = React.useMemo(() => {
    return get(state, ["activeSource", "metadata", "value", "columns"]) || [];
  }, [activeSource]);

  const [viewData, viewDataLength] = useGetViewData({ pgEnv, activeView, xAxisColumn, yAxisColumns });

  const [graphData, dataDomain] = React.useMemo(() => {
    if (!(viewData.length && xAxisColumn && yAxisColumns.length)) {
      return [{}, []];
    }
    const dataGenerator = GraphDataGenerators[activeGraphType.dataGenerator];
    return dataGenerator(viewData, xAxisColumn, yAxisColumns, graphFormat.colors);
  }, [viewData, activeGraphType, xAxisColumn, yAxisColumns, graphFormat.colors]);

  return (
    <div className="bg-gray-200 p-4 grid grid-cols-1 gap-2">

      <SourceSelector pgEnv={ pgEnv }
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
        updateXAxisColumn={ updateXAxisColumn }/>

      <YAxisSelector columns={ columns }
        yAxisColumns={ yAxisColumns }
        setYAxisColumns={ setYAxisColumns }
        updateYAxisColumn={ updateYAxisColumn }/>

      <GraphComponent
        graphFormat={ graphFormat }
        activeGraphType={ activeGraphType }
        graphData={ graphData }
        viewData={ viewData }/>

      <GraphOptionsEditor
        format={ graphFormat }
        edit={ editGraphFormat }
        activeGraphType={ activeGraphType }
        dataDomain={ dataDomain }/>

    </div>
  )
}

const ViewComp = ({ value }) => {
  return (
    <div>
    </div>
  )
}

const GraphComp = {
  name: "Graph Component",
  EditComp,
  ViewComp
}
export default GraphComp
