import React from "react"

import get from "lodash/get"
import { range as d3range } from "d3-array"

import { useFalcor } from "@availabs/avl-falcor"

const NaNValues = ["", null]

export const strictNaN = v => {
  if (NaNValues.includes(v)) return true;
  return isNaN(v);
}

export const useGetSources = ({ pgEnv } = {}) => {
  const { falcor, falcorCache } = useFalcor();

  React.useEffect(() => {
    falcor.get(["dama", pgEnv, "sources", "length"]);
  }, [falcor, pgEnv]);

  React.useEffect(() => {
    const num = get(falcorCache, ["dama", pgEnv, "sources", "length"], 0);
    if (num) {
      falcor.get([
        "dama", pgEnv, "sources", "byIndex", { from: 0, to: num - 1 }, "attributes",
        ["source_id", "name", "metadata", "categories", "type"]
      ])
    }
  }, [falcor, falcorCache, pgEnv]);

  return React.useMemo(() => {
    const num = get(falcorCache, ["dama", pgEnv, "sources", "length"], 0);
    return d3range(num)
      .reduce((a, c) => {
        const ref = get(falcorCache, ["dama", pgEnv, "sources", "byIndex", c, "value"], null);
        if (ref?.length) {
          const source = get(falcorCache, [...ref, "attributes"]);
          a.push(source);
        }
        return a;
      }, [])
        .filter(src => {
          const cats = get(src, ["categories", "value"], []);
          if (!Array.isArray(cats)) return false;
          return cats.reduce((a, c) => {
            return a || c.includes("Cenrep");
          }, false);
        })
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [falcorCache, pgEnv]);
}

export const useGetViews = ({ pgEnv, sourceId = null } = {}) => {
  const { falcor, falcorCache } = useFalcor();

  React.useEffect(() => {
    if (strictNaN(sourceId)) return;
    falcor.get(["dama", pgEnv, "sources", "byId", sourceId, "views", "length"]);
  }, [falcor, pgEnv, sourceId]);

  React.useEffect(() => {
    const num = get(falcorCache, ["dama", pgEnv, "sources", "byId", sourceId, "views", "length"], 0);
    if (num) {
      falcor.get([
        "dama", pgEnv, "sources", "byId", sourceId, "views",
        "byIndex", { from: 0, to: num - 1 }, "attributes",
        ["view_id", "source_id", "version", "metadata"]
      ])
    }
  }, [falcor, falcorCache, pgEnv, sourceId]);

  return React.useMemo(() => {
    const num = get(falcorCache, ["dama", pgEnv, "sources", "byId", sourceId, "views", "length"], 0);
    return d3range(num)
      .reduce((a, c) => {
        const ref = get(falcorCache, ["dama", pgEnv, "sources", "byId", sourceId, "views", "byIndex", c, "value"], null);
        if (ref?.length) {
          const view = get(falcorCache, [...ref, "attributes"]);
          a.push(view);
        }
        return a;
      }, [])
        .sort((a, b) => b.view_id - a.view_id);
  }, [falcorCache, pgEnv, sourceId]);
}

export const useGetViewData = ({ activeView, xAxisColumn, yAxisColumns, pgEnv }) => {

  const { falcor, falcorCache } = useFalcor();

  const [dataLength, setDataLength] = React.useState(0);

  const options = React.useMemo(() => {
    if (!xAxisColumn) return "{}";
    return JSON.stringify({
      aggregatedLen: true,
      groupBy: [xAxisColumn.name]
    });
  }, [xAxisColumn]);

  const yColumnsMap = React.useMemo(() => {
    return yAxisColumns.reduce((a, c) => {
      const { name, aggMethod } = c;
      a[`${ aggMethod }(${ name }) AS ${ name }`] = name;
      return a;
    }, {});
  }, [yAxisColumns]);

  React.useEffect(() => {
    if (!activeView) return;

    const vid = activeView.view_id;

    falcor.get(["dama", pgEnv, "viewsbyId", vid, "options", options, "length"]);
  }, [falcor, pgEnv, activeView, options]);

  React.useEffect(() => {
    if (!activeView) return;

    const vid = activeView.view_id;

    const length = get(falcorCache, ["dama", pgEnv, "viewsbyId", vid, "options", options, "length"], 0);

    const columns = [
      get(xAxisColumn, "name", null),
      ...Object.keys(yColumnsMap)
    ].filter(Boolean);

    if (length && !strictNaN(length) && columns.length) {
      falcor.get([
        "dama", pgEnv, "viewsbyId", vid, "options", options, "databyIndex", d3range(length), columns
      ]);
    }
  }, [falcor, falcorCache, pgEnv, activeView, xAxisColumn, options, yColumnsMap]);

  return React.useMemo(() => {
    if (!activeView) return [[], 0];
    if (!xAxisColumn) return [[], 0];

    const vid = activeView.view_id;

    const length = get(falcorCache, ["dama", pgEnv, "viewsbyId", vid, "options", options, "length"], 0);

    const data = d3range(length)
      .reduce((a, c) => {
        const data = get(falcorCache, ["dama", pgEnv, "viewsbyId", vid, "options", options, "databyIndex", c]);
        if (data) {
          for (const key in yColumnsMap) {
            a.push({
              index: data[xAxisColumn.name],
              value: +data[key],
              type: yColumnsMap[key]
            })
          }
        }
        return a;
      }, []);

    const { sortMethod } = xAxisColumn;

    if (sortMethod !== "none") {
      data.sort((a, b) => {
        switch (sortMethod) {
          case "ascending":
            return String(a.index).localeCompare(String(b.index));
          case "descending":
            return String(b.index).localeCompare(String(a.index));
        }
      })
    }

    return [data, length];
  }, [falcorCache, pgEnv, activeView, options, xAxisColumn, yColumnsMap]);
}
