// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import warning from 'warning'
import {Switch} from '../switch'

const warningMessage = {
  onWithoutOnChange: "You provided a `on` prop to a the Toggle component without an `onChange` handler. This will render a read-only field. Otherwise, set either `onChange` or `readOnly`.",
  valueForOnChangesToUndefinedOrNull: "Thig is now being controlled",
  undefinedOrNullForOnChangesToValue: "Not long er being controlled"
}

const callAll = (...fns) => (...args) => fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

function useControlledWarnings({ onChange, onIsControlled, readOnly }) {
  const hasOnChange = Boolean(onChange)
  const {current: onWasControlled} = React.useRef(onIsControlled)
  const inProduction = process.env.NODE_ENV === 'production'
  
  React.useEffect(
    function consoleAlertForMisusedProps() {
      warning(
        !(onIsControlled && !hasOnChange && !readOnly && inProduction),
        warningMessage.onWithoutOnChange
      )
    }, [onIsControlled, hasOnChange, readOnly, inProduction])

  React.useEffect(
    function consoleAlertIfOnChangesToControlledStatus() {
      warning(
        !(onIsControlled && !onWasControlled && inProduction),
        warningMessage.valueForOnChangesToUndefinedOrNull
      )
      warning(
        !(!onIsControlled && onWasControlled && inProduction),
        warningMessage.undefinedOrNullForOnChangesToValue
      )
    }, [onWasControlled, onIsControlled, inProduction])
}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  on: controlledOn,
  onChange,
  readOnly = false
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const onIsControlled = controlledOn != null
  const on = onIsControlled ? controlledOn : state.on
  
  useControlledWarnings({ onChange, onIsControlled, readOnly })

  function dispatchWithOnChange(action) {
    if (!onIsControlled) { 
      dispatch(action)
    }
    onChange && onChange(reducer({...state, on}, action), action)
  }  

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
  const reset = () => dispatchWithOnChange({type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({on: controlledOn, onChange}) {
  const {on, getTogglerProps} = useToggle({on: controlledOn, onChange})
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
