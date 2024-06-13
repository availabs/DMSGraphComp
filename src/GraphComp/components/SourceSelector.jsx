import React from "react"

import { Select } from "~/modules/avl-components/src"

import { useGetSources } from "./utils"

export const SourceSelector = ({ setActiveSource, pgEnv }) => {
  const sources = useGetSources({ pgEnv });

  const [sourceId, _setSourceId] = React.useState(null);

  const setSourceId = React.useCallback(sid => {
    _setSourceId(sid);
    setActiveSource(
      sources.find(source => {
        return source.source_id === sid;
      })
    )
  }, [sources, setActiveSource]);

  return (
    <div>
      <div className="font-bold">Sources</div>
      <Select options={ sources }
        accessor={ o => o.name }
        valueAccessor={ o => o.source_id }
        value={ sourceId }
        onChange={ setSourceId }
        placeholder="Select a source..."/>
    </div>
  )
}
