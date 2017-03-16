import { EFFECT_NONE, EFFECT_ALL } from './effects'
import calculateDropEffect from './drop-effect'
import { setDropEffect, getDropEffect, setEffectAllowed } from './event-access'

let globalDropEffect = null

export const setCurrentDropEffect = (event, dropEffect) => {
  globalDropEffect = dropEffect
  setDropEffect(event, dropEffect)
}

export const getCurrentDropEffect = event => globalDropEffect || getDropEffect(event)

export const handleDragStart = (event) => {
  globalDropEffect = null
  setEffectAllowed(event, EFFECT_ALL)
}

export const handleDragEnd = (event) => {
  const dropEffect = getCurrentDropEffect(event)
  globalDropEffect = null
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
  globalDropEffect = null
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
