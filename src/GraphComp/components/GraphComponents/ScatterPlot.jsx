import React from "react"

import * as Plot from "@observablehq/plot";

import { TickFormatOptionsMap } from "../GraphOptionsEditor"
import { useAxisTicks } from "./utils"

const ScatterPlot = props => {

  const {
    data,
    margins,
    height,
    width,
    xAxis,
    yAxis,
    colors,
    bgColor,
    legend,
    tooltip
  } = props

  const [ref, setRef] = React.useState(null);

  const xAxisTicks = useAxisTicks(data, xAxis.tickSpacing);

  const graphHeight = React.useMemo(() => {
    const { marginTop: mt, marginBottom: mb } = margins;
    if ((mt + mb) > height) {
      return mt + mb + 100;
    }
    return height;
  }, [height, margins]);

  React.useEffect(() => {
    if (!ref) return;
    if (!data.length) return;

    const plot = Plot.plot({
      x: {
        type: "point",
        label: xAxis.label,
        grid: xAxis.showGridLines,
        textAnchor: xAxis.rotateLabels ? "start" : "middle",
        tickRotate: xAxis.rotateLabels ? 45 : 0,
        axis: "bottom",
        ticks: xAxisTicks
      },
      y: {
        axis: "left",
        grid: yAxis.showGridLines,
        tickFormat: TickFormatOptionsMap[yAxis.tickFormat],
        label: yAxis.label
      },
      color: {
        legend: legend.show,
        width: legend.width,
        height: legend.height,
        label: legend.label,
        range: colors.value
      },
      height: graphHeight,
      width,
      ...margins,
      marks: [
        Plot.ruleY([0]),
        Plot.dot(
          data,
          { x: "index",
            y: "value",
            stroke: "type",
            sort: { x: "x", order: null },
            tip: !tooltip.show ? undefined :
              { fill: bgColor,
                fontSize: tooltip.fontSize,
                y: "value"
              }
          }
        ),
        Plot.crosshair(data,
          Plot.pointer({
            x: "index",
            y: "value"
          })
        )
      ]
    });

    ref.append(plot);

    return () => plot.remove();

  }, [ref, data, margins, height, width, xAxisTicks, xAxis, yAxis, colors, bgColor, legend, tooltip]);

  return (
    <div ref={ setRef }/>
  )
}
export const ScatterPlotOption = {
  type: "Scatter Plot",
  GraphComp: "ScatterPlot",
  Component: ScatterPlot
}
