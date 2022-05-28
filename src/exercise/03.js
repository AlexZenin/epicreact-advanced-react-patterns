// Flexible Compound Components
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'
import {Switch} from '../switch'

const ToggleContext = React.createContext()
ToggleContext.displayName = "ToggleContext"

function Toggle({children}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return (
    <ToggleContext.Provider value={{ on, toggle }}> 
      {children} 
    </ToggleContext.Provider>
  )
}

function useToggleContext() {
  const state =  React.useContext(ToggleContext)
  if (state === undefined) {
    throw new Error('useToggleContext must be used inside a Toggle component')
  }
  return state
}

function ToggleOn({children}) {
  const { on } = useToggleContext()
  return on ? children : null
}

function ToggleOff({children}) {
  const { on } = useToggleContext()
  return on ? null : children
}

function ToggleButton(props) {
  const { on, toggle } = useToggleContext()
  return <Switch on={on} onClick={toggle} {...props} />
}

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <div>
          <ToggleButton />
        </div>
      </Toggle>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
