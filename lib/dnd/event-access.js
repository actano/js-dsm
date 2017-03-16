import { EFFECT_UNINITIALIZED, EFFECT_NONE } from './effects'

// in react-dev, ie does not allow access to these properties
// https://github.com/facebook/react/issues/5700

export const getEffectAllowed = (event) => {
  const dt = event.dataTransfer
  try {
    return dt.effectAllowed
  } catch (err) {
    return EFFECT_UNINITIALIZED
  }
}

export const setEffectAllowed = (event, effectAllowed) => {
  const dt = event.dataTransfer
  try {
    dt.effectAllowed = effectAllowed
  } catch (err) {
    // ignore
  }
}

export const getDropEffect = (event) => {
  const dt = event.dataTransfer
  try {
    return dt.dropEffect || EFFECT_NONE
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

