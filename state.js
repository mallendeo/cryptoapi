'use strict'

const initState = () => {
  let state = {}

  const setState = newState => {
    state = Object.assign({}, state, newState)
    return state
  }

  const getState = () => state

  return {
    setState,
    getState
  }
}

module.exports = initState()
