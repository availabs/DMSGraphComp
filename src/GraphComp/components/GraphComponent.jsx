import React from "react"

import get from "lodash/get"

import {
  BarGraph,
  LineGraph
} from "~/modules/avl-graph/src"

import { getColorRange } from "~/modules/avl-graph/src"

export const DefaultPalette = getColorRange(12, "Set3");
export const DefaultScaleRange = getColorRange(7, "RdYlGn");

export const getNewGraphFormat = () => ({
  title: "",
  description: "",
  data: [],
  colors: {
    type: "palette",
    value: [...DefaultPalette]
  },
  height: 300,
  width: "full",
  margin: {
    top: 20,
    right: 20,
    bottom: 50,
    left: 100
  },
  xAxis: {
    label: "",
    rotateLabels: false,
    tickDensity: 2
  },
  yAxis: {
    label: "",
    showGridLines: true
  }
})

const GraphTypes = {
  BarGraph,
  LineGraph
}

const ColorFuncs = {
  BarGraph: (v, i, d, k) => d.colors[k],
  LineGraph: (d, i) => d.color
}

export const GraphComponent = ({ graphFormat, activeGraphType, graphData, viewData }) => {

  const GraphComp = React.useMemo(() => {
    return GraphTypes[activeGraphType.GraphComp];
  }, [activeGraphType]);

  const colors = React.useMemo(() => {
    const { domain: dataDomain } = graphData;
    const type = get(graphFormat, ["colors", "type"], null);
    switch (type) {
      case "palette":
        return get(graphFormat, ["colors", "value"], null);
      case "scale":
        const {
          type,
          range
        } = get(graphFormat, ["colors", "value"], {});
      default:
        return [...DefaultPalette];
    }
  }, [graphFormat, graphData]);

  return (
    <div>

      <div className="font-bold text-2xl text-center">
        { get(graphFormat, ["title"]) }
      </div>

      <div style={ {
          height: `${ get(graphFormat, ["height"]) }px`
        } }
      >
        { !activeGraphType ? null :
          <GraphComp { ...graphData }
            colors={ ColorFuncs[activeGraphType.GraphComp] }
            axisBottom={ {
              label: get(graphFormat, ["xAxis", "label"]),
              rotateLabels: get(graphFormat, ["xAxis", "rotateLabels"], false),
              tickDensity: +get(graphFormat, ["xAxis", "tickDensity"])
            } }
            axisLeft={ {
              label: get(graphFormat, ["yAxis", "label"]),
              showGridLines: get(graphFormat, ["yAxis", "showGridLines"], true)
            } }
            margin={ {
              top: +get(graphFormat, ["margin", "top"]),
              right: +get(graphFormat, ["margin", "right"]),
              bottom: +get(graphFormat, ["margin", "bottom"]),
              left: +get(graphFormat, ["margin", "left"])
            } }/>
        }
      </div>

    </div>
  )
}
