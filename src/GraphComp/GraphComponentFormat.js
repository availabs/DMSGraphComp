import { getColorRange } from "~/modules/avl-graph/src"

const DefaultColorRange = getColorRange(11, "Set3")

const GraphComponentFormat = {
  source: {
    sourceId: "number",
    xAxisColumn: {
      name: "string",
      sortMethod: "enum: ['NONE', 'ASC', 'DESC']"
    },
    yAxisColumns: [
      { name: "string",
        aggMethod: "enum: ['SUM', 'AVG', 'COUNT']"
      }
    ],
    view: {
      viewId: "number"
    }
  },
  graph: {
    type: "enum: ['BarGraph', 'LineGraph']",
    title: "string",
    description: "string",
    data: [],
    colors: ["string", "string", "..."],
    height: "enum: [number, 'full']",
    width: "enum: [number, 'full']",
    margin: {
      top: "number",
      right: "number",
      bottom: "number",
      left: "number"
    },
    xScale: {
      type: ""
    },
    yScale: {
      type: ""
    },
    xAxis: {
      label: "string",
      rotateLabels: "number[0, 90]",
      tickDensity: "number"
    },
    yAxis: {
      label: "string",
      showGridLines: "boolean"
    }
  }
}

export const getNewGraphFormat = () => ({
  source: {
    sourceId: null,
    view: {
      viewId: null
    }
  },
  graph: {
    type: null,
    title: "",
    description: "",
    data: [],
    colors: [...DefaultColorRange],
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
  }
})
