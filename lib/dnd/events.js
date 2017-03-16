import { toStandardName, EFFECT_NONE, toList, EFFECT_ALL } from './effects'
import { getTextType, getURLType, IE_TEXT, IE_URL } from './data'
import { setState, clearState, getState } from './state'
import { getCurrentDropEffect, calculateDropEffect, setCurrentDropEffect } from './drop-effect'
import { setDropEffect } from './event-access'

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

const handleDragStartEffects = (event, ...effectsAllowed) => {
  const dt = event.dataTransfer
  dt.effectAllowed = toStandardName(effectsAllowed)
}

export const handleDragStart = (event, data, ...effectsAllowed) => {
  const allowed = effectsAllowed.length ? effectsAllowed : toList(EFFECT_ALL)
  const dndState = { effectsAllowed: allowed }
  const ie = handleDragStartData(event, data)
  if (ie) {
    dndState.data = data
    handleDragStartEffects(event, allowed[0])
  } else {
    handleDragStartEffects(event, ...allowed)
  }
  setState(dndState)
}

export const handleDragEnd = (event, ...effectsAllowed) => {
  const dropEffect = getCurrentDropEffect(event, ...effectsAllowed)
  clearState()
  return dropEffect
}

export const handleDragEnter = (event, ...effectsAllowed) => {
  const dropEffect = calculateDropEffect(event, ...effectsAllowed)
  setCurrentDropEffect(event, dropEffect)
  if (dropEffect === EFFECT_NONE) {
    return null
  }
  event.preventDefault()
  return dropEffect
}

export const handleDragLeave = () => {
  const dndState = getState()
  dndState.dropEffect = null
  setState(dndState)
  return null
}

export const handleDragOver = handleDragEnter

export const handleDrop = (event, ...effectsAllowed) => {
  const dropEffect = getCurrentDropEffect(event, ...effectsAllowed)
  if (dropEffect === EFFECT_NONE) {
    return null
  }
  event.preventDefault()
  setDropEffect(event, dropEffect)
  return dropEffect
}
