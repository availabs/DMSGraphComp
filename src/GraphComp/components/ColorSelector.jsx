import React from "react"

// import { ColorInput } from "~/modules/avl-components/src"
import { ColorInput } from "./ColorEditor/components"

const ColorOption = ({ color, update, size = 4 }) => {
  const doUpdate = React.useCallback(e => {
    e.stopPropagation();
    update(color);
  }, [update, color]);
  const [hovering, setHovering] = React.useState(false);
  const onMouseEnter = React.useCallback(e => {
    setHovering(true);
  }, []);
  const onMouseLeave = React.useCallback(e => {
    setHovering(false);
  }, []);
  return (
    <div onClick={ doUpdate }
      onMouseEnter={ onMouseEnter }
      onMouseLeave={ onMouseLeave }
      className={ `
        w-${ size } h-${ size } mb-2 mr-2 cursor-pointer outline
      ` }
      style={ {
        backgroundColor: color,
        outlineColor: hovering ? color : "transparent",
        outlineWidth: "0.125rem"
      } }/>
  )
}

export const ColorSelector = ({ editKey, edit, current, palette, label }) => {

  const onChange = React.useCallback(v => {
    edit([editKey], v)
  }, [editKey, edit]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <div className="mr-2 font-bold text-lg">
          Select a { label } Color
        </div>
        <ColorInput large preview={ false }
          value={ current }
          onChange={ onChange }/>
      </div>
      <div>
        <div>
          <div className="mr-2 font-bold text-lg">
            Current Palette
          </div>
          <div className="flex">
            { palette.map(color => (
                <ColorOption key={ color }
                  color={ color }
                  update={ onChange }
                  size={ 8 }/>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
