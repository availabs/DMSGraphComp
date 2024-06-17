import React from "react"

import get from "lodash/get"
import set from "lodash/set"
import merge from "lodash/merge"

import { ColorEditor } from "./ColorEditor"

const Modal = ({ isOpen, children }) => {
  const stopPropagation = React.useCallback(e => {
    e.stopPropagation();
  }, []);
  return (
    <div className={ `
        pointer-events-none
        ${ isOpen ? "fixed inset-0 z-50" : "hidden h-0 w-0 overflow-hidden" }
      ` }
    >

      { children }

    </div>
  )
}

export const BooleanInput = ({ value, onChange }) => {
  const doOnChange = React.useCallback(e => {
    onChange(!value);
  }, [onChange, value]);
  return (
    <div className="px-4 py-2 bg-white flex items-center cursor-pointer w-full"
      onClick={ doOnChange }
    >
      <div
        className={ `
          rounded-full w-full h-2 relative transition duration-500
          ${ value ? "bg-blue-300" : "bg-gray-300" }
        ` }
      >
        <div style={ {
            transform: "translate(-50%, -25%)",
            transition: "left 500ms"
          } }
          className={ `
            w-4 h-4 rounded-full absolute transition duration-500
            ${ value ? "left-full bg-blue-700" : "left-0 bg-gray-700" }
          ` }/>
      </div>
    </div>
  )
}

const Input = ({ value, onChange, ...props }) => {
  const doOnChange = React.useCallback(e => {
    onChange(e.target.value);
  }, [onChange]);
  return (
    <div className="w-full">
      <input { ...props }
        className={ `
          px-4 py-2 bg-white cursor-pointer w-full font-medium text-xs
          outline-none
        ` }
        value={ value }
        onChange={ doOnChange }/>
    </div>
  )
}
export const Button = props => {
  return (
    <button { ...props }
      style={ { outline: "none" } }
      className={ `
        px-4 py-2 bg-white cursor-pointer w-full font-medium text-xs
        border-0 border-none outline-0 ring-0 rounded-none
      ` }/>
  )
}

const OptionInput = ({ path, type, value, onChange, ...props }) => {
  const doOnChange = React.useCallback(v => {
    onChange(path, v);
  }, [path, onChange]);
  return (
    <div className="w-60">
      { type === "boolean" ? (
          <BooleanInput value={ value }
            onChange={ doOnChange }/>
        ) : (
          <Input type={ type } { ...props }
            value={ value }
            onChange={ doOnChange }/>
        )
      }
    </div>
  )
}

export const GraphOptionsEditor = ({ format, edit, activeGraphType, dataDomain }) => {

  const doEdit = React.useCallback((path, value) => {
    const merged = merge({}, format);
    set(merged, path, value);
    edit(merged);
  }, [format, edit]);

  const doEditMultiple = React.useCallback(paths => {
    const merged = merge({}, format);
    paths.forEach(([path, value]) => {
      set(merged, path, value);
    })
    edit(merged);
  }, [format, edit]);

  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(e => {
    e.stopPropagation();
    setIsOpen(true);
  }, []);
  const close = React.useCallback(e => {
    e.stopPropagation();
    setIsOpen(false);
  }, []);

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
              path={ ["height"] }
              value={ get(format, ["height"], 0) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Title
            </div>
            <OptionInput type="text"
              path={ ["title"] }
              value={ get(format, ["title"], 0) }
              placeholder="Enter a title..."
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Colors
            </div>
            <div className="w-60">
              <Button onClick={ open }>
                Open Color Editor
              </Button>
            </div>
          </div>

          <Modal isOpen={ isOpen }>
            <div className={ `
                h-[42.5vh] bg-gray-300 absolute bottom-0 left-0 right-0
                pointer-events-auto
              `}
            >
              <button style={ { transform: "translate(50%, -150%)" } }
                className={ `
                  w-8 h-8 rounded absolute
                  flex items-center justify-center
                  bg-gray-300 hover:bg-gray-400
                  top-0 left-0 border-0
                ` }
                onClick={ close }
              >
                <span className="fa fa-close"/>
              </button>
              <ColorEditor
                edit={ doEdit }
                editAll={ doEditMultiple }
                format={ format }
                graphType={ activeGraphType.type }
                dataDomain={ dataDomain }/>
            </div>
          </Modal>

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
              path={ ["margin", "top"] }
              value={ get(format, ["margin", "top"], 0) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Right
            </div>
            <OptionInput type="number"
              path={ ["margin", "right"] }
              value={ get(format, ["margin", "right"], 0) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Bottom
            </div>
            <OptionInput type="number"
              path={ ["margin", "bottom"] }
              value={ get(format, ["margin", "bottom"], 0) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Left
            </div>
            <OptionInput type="number"
              path={ ["margin", "left"] }
              value={ get(format, ["margin", "left"], 0) }
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
              path={ ["xAxis", "label"] }
              value={ get(format, ["xAxis", "label"], "") }
              placeholder="Enter a label..."
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Tick Density
            </div>
            <OptionInput type="number"
              path={ ["xAxis", "tickDensity"] }
              value={ get(format, ["xAxis", "tickDensity"]) }
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Rotate Labels
            </div>
            <OptionInput type="boolean"
              path={ ["xAxis", "rotateLabels"] }
              value={ get(format, ["xAxis", "rotateLabels"], "") }
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
              path={ ["yAxis", "label"] }
              value={ get(format, ["yAxis", "label"], "") }
              placeholder="Enter a label..."
              onChange={ doEdit }/>
          </div>

          <div className="flex">
            <div className="w-1/3">
              Show Grid Lines
            </div>
            <OptionInput type="boolean"
              path={ ["yAxis", "showGridLines"] }
              value={ get(format, ["yAxis", "showGridLines"], "") }
              onChange={ doEdit }/>
          </div>

        </div>
      </div>

    </div>
  )
}
