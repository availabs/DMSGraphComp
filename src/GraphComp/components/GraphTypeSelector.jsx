import React from "react"

import get from "lodash/get"
import {
  groups as d3groups,
  sum as d3sum,
  mean as d3mean,
  count as d3count,
  extent as d3extent
} from "d3-array"
import {
  scaleQuantile,
  scaleQuantize,
  scaleThreshold
} from "d3-scale"

import { Select } from "~/modules/avl-components/src"

import { getColorRange } from "~/modules/avl-graph/src"

import { strictNaN } from "./utils"

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

const getScale = (type, domain, range) => {
  switch (type) {
    case "quantile":
      return scaleQuantile(domain, range);
    case "quantize":
      return scaleQuantize(d3extent(domain), range);
    case "threshold":
      return scaleThreshold(domain, range);
  }
}

const getBarColorFunc = (colors, keys, dataDomain) => {
  switch (colors.type) {
    case "palette": {
      const range = colors.value;
      return () => {
        return keys.reduce((a, c, i) => {
          a[c] = range[i % range.length];
          return a;
        }, {});
      }
    }
    case "scale": {
      const { type, range, domain = null } = colors.value;
      const scale = getScale(type, domain || dataDomain, range);
      return bar => {
        return keys.reduce((a, c) => {
          a[c] = scale(bar[c]);
          return a;
        }, {});
      }
    }
  }
}

const generateBarData = (sourceData, xColumn, yColumns, colors) => {
  const index = xColumn.name;
  const keys = yColumns.map(col => col.name);
  const sortMethod = xColumn.sortMethod;

  const domain = [];

  const data = d3groups(sourceData, d => d[index])
    .map(([index, data]) => {
      return {
        index,
        ...yColumns.reduce((a, c) => {
          const k = c.name;
          const reducer = AggregationMethods[c.aggMethod];
          a[k] = reducer(data, d => d[k], c.type);
          domain.push(a[k]);
          return a;
        }, {})
      };
    });

  const colorFunc = getBarColorFunc(colors, keys, domain);

  data.forEach(bar => {
    bar.colors = colorFunc(bar);
  });

  if (sortMethod === "ASC") {
    data.sort((a, b) => String(a.index).localeCompare(String(b.index)));
  }
  else if (sortMethod === "DESC") {
    data.sort((a, b) => String(b.index).localeCompare(String(a.index)));
  }

  return [{ keys, data }, domain];
}

const getLineColorFunc = colors => {
  const range = colors.value;
  return i => range[i % range.length];
}

const generateLineData = (sourceData, xColumn, yColumns, colors) => {
  const index = xColumn.name;
  const keys = yColumns.map(col => col.name);
  const sortMethod = xColumn.sortMethod;

  const groups = d3groups(sourceData, d => d[index]);

  const colorFunc = getLineColorFunc(colors);

  const data = yColumns.map((col, i) => {
    const k = col.name;
    const reducer = AggregationMethods[col.aggMethod];
    return {
      id: k,
      color: colorFunc(i),
      data: groups.map(([x, data]) => {
        return {
          x,
          y: reducer(data, d => d[k], col.type)
        }
      })
    }
  });

  if (sortMethod === "ASC") {
    data.forEach(({ data }) => {
      data.sort((a, b) => String(a.x).localeCompare(String(b.x)));
    });
  }
  else if (sortMethod === "DESC") {
    data.forEach(({ data }) => {
      data.sort((a, b) => String(b.x).localeCompare(String(a.x)));
    });
  }

  return [{ data }, []];
}

export const GraphDataGenerators = {
  generateBarData,
  generateLineData
}

export const GraphOptions = [
  { type: "Bar Graph",
    GraphComp: "BarGraph",
    dataGenerator: "generateBarData"
  },
  { type: "Line Graph",
    GraphComp: "LineGraph",
    dataGenerator: "generateLineData"
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
