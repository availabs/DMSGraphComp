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

  React.useEffect(() => {
    if (!activeView) return;

    const vid = activeView.view_id;

    falcor.get(["dama", pgEnv, "viewsbyId", vid, "data", "length"]);
  }, [falcor, pgEnv, activeView]);

  React.useEffect(() => {
    if (!activeView) return;

    const vid = activeView.view_id;

    const length = get(falcorCache, ["dama", pgEnv, "viewsbyId", vid, "data", "length"], 0);

    const columns = [
      get(xAxisColumn, "name", null),
      ...yAxisColumns.map(c => c.name)
    ].filter(Boolean);

    if (length && !strictNaN(length) && columns.length) {
      falcor.chunk([
        "dama", pgEnv, "viewsbyId", vid, "databyIndex", d3range(length), columns
      ]);
    }
  }, [falcor, falcorCache, pgEnv, activeView, xAxisColumn, yAxisColumns]);

  return React.useMemo(() => {
    if (!activeView) return [0, []];

    const vid = activeView.view_id;

    const length = get(falcorCache, ["dama", pgEnv, "viewsbyId", vid, "data", "length"], 0);

    const data = d3range(length)
      .reduce((a, c) => {
        const ref = get(falcorCache, ["dama", pgEnv, "viewsbyId", vid, "databyIndex", c, "value"], []);
        if (ref?.length) {
          a.push(get(falcorCache, ref));
        }
        return a;
      }, []);

    return [data, length];
  }, [falcorCache, pgEnv, activeView]);
}
