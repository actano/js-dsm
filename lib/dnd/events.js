import { toStandardName, EFFECT_NONE, toList, EFFECT_ALL } from './effects'
import { getTextType, getURLType, IE_TEXT, IE_URL } from './data'
import { setState, clearState, getState } from './state'
import calculateDropEffect from './drop-effect'
import { setDropEffect, getDropEffect, setEffectAllowed } from './event-access'

export const setCurrentDropEffect = (event, dropEffect) => {
  const dndState = getState()
  dndState.dropEffect = dropEffect
  setState(dndState)
  setDropEffect(event, dropEffect)
}

export const getCurrentDropEffect = event => getState().dropEffect || getDropEffect(event)

// return true for IE
const handleDragStartData = (event, data) => {
  const dt = event.dataTransfer
  try {
    for (const key of Object.keys(data)) {
      dt.setData(key, data[key])
    }
    return false
  } catch (err) { // IE < Edge
    const text = getTextType(data)
    if (text) {
      dt.setData(IE_TEXT, text)
    }
    const url = getURLType(data)
    if (url) {
      dt.setData(IE_URL, url)
    }
    return true
  }
}

export const handleDragStart = (event, data, ...effectsAllowed) => {
  const allowed = effectsAllowed.length ? effectsAllowed : toList(EFFECT_ALL)
  const dndState = { effectsAllowed: allowed }
  const ie = handleDragStartData(event, data)
  if (ie) {
    dndState.data = data
    setEffectAllowed(event, allowed[0])
  } else {
    setEffectAllowed(event, toStandardName(allowed))
  }
  setState(dndState)
}

export const handleDragEnd = (event) => {
  const dropEffect = getCurrentDropEffect(event)
  clearState()
  return dropEffect
}

export const handleDragEnter = (event, ...effectsAllowed) => {
  const dropEffect = calculateDropEffect(event, ...effectsAllowed)
  if (dropEffect === EFFECT_NONE) {
    return null
  }
  event.preventDefault()
  setCurrentDropEffect(event, dropEffect)
  return dropEffect
}

export const handleDragLeave = () => {
  const dndState = getState()
  dndState.dropEffect = null
  setState(dndState)
  return null
}

export const handleDragOver = handleDragEnter

export const handleDrop = (event) => {
  const dropEffect = getCurrentDropEffect(event)
  if (dropEffect === EFFECT_NONE) {
    return null
  }
  event.preventDefault()
  setDropEffect(event, dropEffect)
  return dropEffect
}
