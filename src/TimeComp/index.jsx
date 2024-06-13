import React from "react"

const getData = () => {
  return new Promise(resolve => {
    console.log("LOADING START")
    setTimeout(resolve, 5000, ["some", "test", "data"]);
  }).then(data => {
    console.log("LOADING STOP");
    return data;
  })
}

const EditComp = ({ value: saved = "", onChange, ...rest }) => {

console.log("EDIT PROPS:", saved, onChange, rest);

  const [value, setValue] = React.useState(saved);
  const doSetValue = React.useCallback(e => {
    setValue(e.target.value);
  }, []);
  const doOnChange = React.useCallback(e => {
    e.stopPropagation();
    onChange(value);
  }, [onChange, value]);

  return (
    <div>
      <input type="time"
        value={ value }
        onChange={ doSetValue }/>
      <button onClick={ doOnChange }
        className="px-4 py-1 bg-gray-300 rounded"
      >
        save
      </button>
    </div>
  )
}
const ViewComp = ({ value }) => {
  return (
    <div>
      { value }
    </div>
  )
}
const TimeComp = {
  name: "Time Component",
  EditComp,
  ViewComp,
  getData
}
export default TimeComp
