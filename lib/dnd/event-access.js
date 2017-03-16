import { EFFECT_UNINITIALIZED, EFFECT_NONE } from './effects'

export const getEffectAllowed = (event) => {
  try {
    return event.dataTransfer.effectAllowed
  } catch (err) {
    return EFFECT_UNINITIALIZED
  }
}

export const getDropEffect = (event) => {
  try {
    return event.dataTransfer.dropEffect || EFFECT_NONE
  } catch (err) {
    return EFFECT_NONE
  }
}

export const setDropEffect = (event, dropEffect) => {
  const dt = event.dataTransfer
  try {
    dt.dropEffect = dropEffect
  } catch (err) {
    // ignore
  }
}

