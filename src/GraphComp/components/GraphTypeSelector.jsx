import React from "react"
import {
  groups as d3groups,
  sum as d3sum,
  mean as d3mean,
  count as d3count
} from "d3-array"

import { strictNaN } from "./utils"

import { Select } from "~/modules/avl-components/src"

import {
  BarGraph,
  LineGraph,
  generateTestLineData
} from "~/modules/avl-graph/src"

const AggregationMethods = {
  SUM: (d, a, t) => d3sum(d, a),
  AVG: (d, a, t) => d3mean(d, a),
  COUNT: (d, a, t) => {
    if (["number", "integer"].includes(t)) {
      return d3count(d, a);
    }
    return d.length;
  }
}

const generateBarData = (sourceData, xColumn, yColumns) => {
  const index = xColumn.name;
  const keys = yColumns.map(col => col.name);
  const sortMethod = xColumn.sortMethod;

  const data = d3groups(sourceData, d => d[index])
    .map(([index, data]) => {
      return {
        index,
        ...yColumns.reduce((a, c) => {
          const k = c.name;
          const reducer = AggregationMethods[c.aggMethod];
          a[k] = reducer(data, d => d[k], c.type);
          return a;
        }, {})
      };
    })

  if (sortMethod === "ASC") {
    data.sort((a, b) => String(a.index).localeCompare(String(b.index)));
  }
  else if (sortMethod === "DESC") {
    data.sort((a, b) => String(b.index).localeCompare(String(a.index)));
  }

  return { keys, data };
}

const generateLineData = (sourceData, xColumn, yColumns) => {
  const sortMethod = xColumn.sortMethod;

  const groups = d3groups(sourceData, d => d[xColumn.name]);

  const data = yColumns.map(col => {
    const k = col.name;
    const reducer = AggregationMethods[col.aggMethod];
    return {
      id: k,
      data: groups.map(([x, data]) => {
        return {
          x,
          y: reducer(data, d => d[k], col.type)
        }
      }).sort((a, b) => {
        if (sortMethod === "NONE") {
          return 0;
        }
        else if (sortMethod === "ASC") {
          return String(a.x).localeCompare(String(b.x));
        }
        else {
          return String(b.x).localeCompare(String(a.x));
        }
      })
    }
  })

  return { data };
}

export const GraphOptions = [
  { type: "Bar Graph",
    Component: BarGraph,
    dataGenerator: generateBarData
  },
  { type: "Line Graph",
    Component: LineGraph,
    dataGenerator: generateLineData
  }
]

export const GraphTypeSelector = ({ activeGraphType, setActiveGraphType }) => {
  return (
    <div>
      <div className="font-bold">Graphs</div>
      <Select options={ GraphOptions }
        accessor={ o => o.type }
        value={ activeGraphType }
        onChange={ setActiveGraphType }
        placeholder="Select a graph..."/>
    </div>
  )
}
