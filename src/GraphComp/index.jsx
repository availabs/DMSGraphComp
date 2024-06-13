import React from "react"

import get from "lodash/get"
import set from "lodash/set"

import { format as d3format } from "d3-format"

import { Input, BooleanInput } from "~/modules/avl-components/src"
import { getColorRange } from "~/modules/avl-graph/src"

import {
  SourceSelector,
  ViewSelector,
  GraphTypeSelector,
  GraphOptions,
  XAxisSelector,
  YAxisSelector,
  useGetViewData
} from "./components"

import { getNewGraphFormat } from "./GraphComponentFormat"

const DefaultColorRange = getColorRange(11, "Set3");

const IntFormat = d3format(",d");

const OptionInput = ({ path, type, value, onChange }) => {
  const doOnChange = React.useCallback(v => {
    onChange(path, v);
  }, [path, onChange]);
  return type === "boolean" ? (
    <BooleanInput value={ value }
      onChange={ doOnChange }/>
  ) : (
    <Input type={ type }
      value={ value }
      onChange={ doOnChange }/>
  )
}

const GraphOptionsEditor = ({ format, edit }) => {

  const doEdit = React.useCallback((path, value) => {
    edit(set(format, path, value));
  }, [format, edit]);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">

      <div className="font-bold text-xl col-span-2">
        Graph Options
      </div>

      <div>
        <div className="font-bold">
          Graph
        </div>
        <div className="pl-4">

          <div className="flex">
            <div className="w-1/3">
              Height
            </div>
            <OptionInput type="number"
              path={ ["graph", "height"] }
              value={ get(format, ["graph", "height"], 0) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Title
            </div>
            <OptionInput type="text"
              path={ ["graph", "title"] }
              value={ get(format, ["graph", "title"], 0) }
              onChange={ doEdit }/>
          </div>

        </div>
      </div>

      <div>
        <div className="font-bold">
          Margins
        </div>
        <div className="pl-4">

          <div className="flex">
            <div className="w-1/3">
              Top
            </div>
            <OptionInput type="number"
              path={ ["graph", "margin", "top"] }
              value={ get(format, ["graph", "margin", "top"], 0) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Right
            </div>
            <OptionInput type="number"
              path={ ["graph", "margin", "right"] }
              value={ get(format, ["graph", "margin", "right"], 0) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Bottom
            </div>
            <OptionInput type="number"
              path={ ["graph", "margin", "bottom"] }
              value={ get(format, ["graph", "margin", "bottom"], 0) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Left
            </div>
            <OptionInput type="number"
              path={ ["graph", "margin", "left"] }
              value={ get(format, ["graph", "margin", "left"], 0) }
              onChange={ doEdit }/>
          </div>

        </div>
      </div>

      <div>
        <div className="font-bold">
          X Axis
        </div>
        <div className="pl-4">

          <div className="flex">
            <div className="w-1/3">
              Label
            </div>
            <OptionInput type="text"
              path={ ["graph", "xAxis", "label"] }
              value={ get(format, ["graph", "xAxis", "label"], "") }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Tick Density
            </div>
            <OptionInput type="number"
              path={ ["graph", "xAxis", "tickDensity"] }
              value={ get(format, ["graph", "xAxis", "tickDensity"]) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Rotate Labels
            </div>
            <OptionInput type="boolean"
              path={ ["graph", "xAxis", "rotateLabels"] }
              value={ get(format, ["graph", "xAxis", "rotateLabels"], "") }
              onChange={ doEdit }/>
          </div>

        </div>
      </div>

      <div>
        <div className="font-bold">
          Y Axis
        </div>
        <div className="pl-4">

          <div className="flex">
            <div className="w-1/3">
              Label
            </div>
            <OptionInput type="text"
              path={ ["graph", "yAxis", "label"] }
              value={ get(format, ["graph", "yAxis", "label"], "") }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Show Grid Lines
            </div>
            <OptionInput type="boolean"
              path={ ["graph", "yAxis", "showGridLines"] }
              value={ get(format, ["graph", "yAxis", "showGridLines"], "") }
              onChange={ doEdit }/>
          </div>

        </div>
      </div>

    </div>
  )
}

const InitialState = {
  activeSource: undefined,
  activeView: undefined,
  activeGraphType: GraphOptions[0],
  xAxisColumn: undefined,
  yAxisColumns: [],
  graphFormat: getNewGraphFormat()
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
      case "set-active-graph-type":
        return {
          ...state,
          activeGraphType: payload.graph
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

  const [state, dispatch] = React.useReducer(Reducer, InitialState);

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

  const [viewDataLength, viewData] = useGetViewData({ pgEnv, activeView, xAxisColumn, yAxisColumns });

  const graphData = React.useMemo(() => {
    if (!(viewData.length && xAxisColumn && yAxisColumns.length)) {
      return { data: [], keys: [] };
    }
    return activeGraphType.dataGenerator(viewData, xAxisColumn, yAxisColumns);
  }, [viewData, activeGraphType, xAxisColumn, yAxisColumns]);

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

      <div>
        <div className="font-bold text-2xl text-center">
          { get(graphFormat, ["graph", "title"]) }
        </div>

        <div style={ {
            height: `${ get(graphFormat, ["graph", "height"]) }px`
          } }
        >
          { !activeGraphType ? null :
            <activeGraphType.Component
              { ...graphData }
              axisBottom={ {
                label: get(graphFormat, ["graph", "xAxis", "label"]),
                rotateLabels: get(graphFormat, ["graph", "xAxis", "rotateLabels"], false),
                tickDensity: +get(graphFormat, ["graph", "xAxis", "tickDensity"])
              } }
              axisLeft={ {
                label: get(graphFormat, ["graph", "yAxis", "label"]),
                showGridLines: get(graphFormat, ["graph", "yAxis", "showGridLines"], true)
              } }
              margin={ {
                top: +get(graphFormat, ["graph", "margin", "top"]),
                right: +get(graphFormat, ["graph", "margin", "right"]),
                bottom: +get(graphFormat, ["graph", "margin", "bottom"]),
                left: +get(graphFormat, ["graph", "margin", "left"])
              } }
              colors={ DefaultColorRange }/>
          }
        </div>

      </div>

      <GraphOptionsEditor
        format={ graphFormat }
        edit={ editGraphFormat }/>

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
