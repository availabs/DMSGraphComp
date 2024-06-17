import React from "react"

import { groups as d3groups } from "d3-array"
import isEqual from "lodash/isEqual"

import { Select } from "~/modules/avl-components/src"
import { ColorRanges } from "~/modules/avl-graph/src"

import { DefaultPalette, DefaultScaleRange } from "./GraphComponent"
import { BooleanInput, Button } from "./GraphOptionsEditor"

const Radios = ({ value, onChange, disableScale = false }) => {
  const doOnChange = React.useCallback(e => {
    onChange(e.target.value);
  }, [onChange]);
  return (
    <div className="grid grid-cols-2 gap-4 border-b-2 border-current w-1/2">

      <div className="flex items-center mr-3 cursor-pointer w-fit">
        <label htmlFor="palette"
          className="flex items-center cursor-pointer font-bold">
          Select a color palette
          <input type="radio" name="radio-group"
            value="palette" id="palette"
            className="ml-2 cursor-pointer"
            checked={ value === "palette" }
            onChange={ doOnChange }/>
        </label>
      </div>

      <div className="flex items-center ml-3 cursor-pointer w-fit">
        <label htmlFor="scale"
          className={ `
            flex items-center cursor-pointer font-bold
            ${ disableScale ? "opacity-50" : "" }
          ` }
        >
          Create a color scale
          <input type="radio" name="radio-group"
            value="scale" id="scale"
            className="ml-2 cursor-pointer"
            checked={ value === "scale" }
            onChange={ doOnChange }
            disabled={ disableScale }/>
        </label>
      </div>

    </div>
  )
}

export const ColorEditor = ({ graphType, format, edit, editAll, dataDomain }) => {

  const editColorType = React.useCallback(v => {
    const edit1 = [["colors", "type"], v]
    const edit2 = [];
    if (v === "palette") {
      edit2.push(["colors", "value"], [...DefaultPalette]);
    }
    else {
      edit2.push(["colors", "value"], { type: "quantize", range: [...DefaultScaleRange] });
    }
    editAll([edit1, edit2]);
  }, [editAll]);

  return (
    <div className="px-6 py-2 relative">
      <div className="font-bold text-xl">
        Color Editor
      </div>
      <Radios disableScale={ graphType !== "Bar Graph" }
        value={ format.colors.type }
        onChange={ editColorType }/>

      { format?.colors?.type === "palette" ?
          <PaletteEditor
            current={ format.colors.value }
            edit={ edit }/> :
        format?.colors?.type === "scale" ?
          <ScaleEditor
            current={ format.colors.value }
            edit={ edit }
            editAll={ editAll }
            dataDomain={ dataDomain }/> :
        null
      }
    </div>
  )
}

const Palette = ({ palette }) => {
  return (
    <div className="flex">
      { palette.map(c => (
          <div key={ c }
            style={ { backgroundColor: c } }
            className="first:rounded-l last:rounded-r h-3 w-6"/>
        ))
      }
    </div>
  )
}

const PaletteOption = ({ select, palette, isActive }) => {
  const doSelect = React.useCallback(e => {
    select(palette);
  }, [select, palette]);
  return (
    <div onClick={ doSelect }
      className={ `
        first:mt-0 mt-1 w-fit rounded-lg
        ${ isActive ? "outline outline-2" : "cursor-pointer" }
      ` }
    >
      <Palette palette={ palette }/>
    </div>
  )
}

const PaletteSelector = ({ select, current }) => {
  const [size, _setSize] = React.useState(current.length);
  const setSize = React.useCallback(e => {
    _setSize(e.target.value);
  }, []);
  const sizes = React.useMemo(() => {
    return Object.keys(ColorRanges).map(Number);
  }, []);

  const [reverse, setReverse] = React.useState(false);

  const palettes = React.useMemo(() => {
    return d3groups(ColorRanges[size], p => p.type)
      .map(([t, ps]) => {
        return reverse ?
          [t, ps.map(c => ({ ...c, colors: [...c.colors].reverse() }))] :
          [t, ps.map(c => ({ ...c, colors: [...c.colors] }))];
      }).sort((a, b) => a[0].localeCompare(b[0]));
  }, [size, reverse]);

  return (
    <>
      <div className="grid grid-cols-4 gap-4">

        <div className="col-span-2 grid grid-cols-2 gap-4 border-b-2 border-gray-500 pb-1">
          <div className="flex items-center">
            <span className="mr-2 w-48">
              Palette Lengths:
            </span>
            <div className="w-64">
              <select value={ size }
                onChange={ setSize }
                className="text-xs font-medium px-2 py-1 bg-white w-full"
                style={ { outline: "none", border: "none" } }
              >
                { sizes.map(o => (
                    <option key={ o } value={ o }>
                      { o }
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <span className="mr-2 w-48">
              Reverse Palettes:
            </span>
            <div className="w-64">
              <BooleanInput
                value={ reverse }
                onChange={ setReverse }/>
            </div>
          </div>
        </div>

      </div>

      <div className="grid gap-4 grid-cols-4">
        { palettes.map(([type, palettes]) => (
            <div key={ type }>
              <div className="border-b-2 border-gray-400">{ type }</div>
              <div className="h-fit max-h-[12.5rem] overflow-auto p-1">
                { palettes.map((p, i) => (
                    <PaletteOption key={ p.colors.join("-") }
                      palette={ p.colors }
                      isActive={ isEqual(p.colors, current) }
                      select={ select }/>
                  ))
                }
              </div>
            </div>
          ))
        }
      </div>
    </>
  )
}

const PaletteEditor = ({ current, edit }) => {

  const doEdit = React.useCallback(palette => {
    edit(["colors", "value"], [...palette]);
  }, [edit]);

  return (
    <div>

      <div className="flex items-center border-b-2 border-gray-600 mb-1 w-1/2">
        <span className="mr-2 whitespace-nowrap w-32">
          Current Palette:
        </span>
        <Palette palette={ current }/>
      </div>

      <PaletteSelector
        current={ current }
        select={ doEdit }/>

    </div>
  )
}

const ScaleTypeOptions = [
  "quantize",
  "quantile",
  "threshold"
]

const ChevronsRight = () => {
  return (
    <>
      <span className="fa fa-chevron-right"/>
      <span className="fa fa-chevron-right"/>
      <span className="fa fa-chevron-right"/>
    </>
  )
}
const ChevronsLeft = () => {
  return (
    <>
      <span className="fa fa-chevron-left"/>
      <span className="fa fa-chevron-left"/>
      <span className="fa fa-chevron-left"/>
    </>
  )
}

const ScaleEditor = ({ current, edit, editAll, dataDomain }) => {

  const {
    type: scaleType,
    range: scaleRange,
    domain: thresholdDomain = []
  } = current;

  const [isOpen, setIsOpen] = React.useState(false);
  const toggle = React.useCallback(e => {
    setIsOpen(o => !o);
  }, []);



  const editScaleType = React.useCallback(e => {
    const type = e.target.value;
    const edit1 = [["colors", "value", "type"], type];
    const edit2 = [];
    switch (type) {
      case "threshold":
        edit2.push(["colors", "value", "domain"], []);
        break;
      default:
        edit2.push(["colors", "value", "domain"], null);
    }
    editAll([edit1, edit2])
  }, [editAll, dataDomain]);

  // const editScaleType = React.useCallback(e => {
  //   const type = e.target.value;
  //   edit(["colors", "value", "type"], type);
  //   if (type !== "threshold") {
  //     setIsOpen(false);
  //   }
  // }, [edit]);

  const editScaleRange = React.useCallback(range => {
    edit(["colors", "value", "range"], [...range]);
  }, [edit]);

  return (
    <div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex border-b-2 border-gray-600 mb-1">
            <div className="flex items-center">
              <span className="mr-2 whitespace-nowrap w-32">Scale Type:</span>
              <select value={ scaleType }
                onChange={ editScaleType }
                className="text-xs font-medium px-2 py-1 bg-white"
              >
                { ScaleTypeOptions.map(o => (
                    <option key={ o }
                      value={ o }
                    >
                      { o }
                    </option>
                  ))
                }
              </select>
            </div>
            <div className="flex-1 flex items-center justify-end">
              { scaleType !== "threshold" ? null :
                <button onClick={ toggle }
                  className="px-2 py-1 text-xs font-medium rounded-none bg-white"
                  style={ { outline: "none", border: "none" } }
                >
                  <span className="mr-4">
                    { isOpen ? "Close" : "Open" } Threshold Editor
                  </span>
                  { isOpen ? <ChevronsLeft /> : <ChevronsRight /> }
                </button>
              }
            </div>
          </div>

          <div className="flex items-center border-b-2 border-gray-600 mb-1">
            <span className="mr-2 whitespace-nowrap w-32">
              Scale Range:
            </span>
            <Palette palette={ scaleRange }/>
          </div>
        </div>
      </div>

      <PaletteSelector
        current={ scaleRange }
        select={ editScaleRange }/>

      <div className={ `
          w-1/2 absolute right-0 top-0 bottom-0 bg-gray-400 px-6 py-2
          ${ isOpen ? "block" : "hidden w-0 h-0 p-0 overflow-hidden"}
        ` }
      >
        Threshold Editor
      </div>

    </div>
  )
}
