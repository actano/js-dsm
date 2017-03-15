import _debug from 'debug'

const stateDebug = _debug('dnd.state')

// https://github.com/marceljuenemann/angular-drag-and-drop-lists/wiki/Drop-Effects-Design

// effects

export const EFFECT_MOVE = 'move'
export const EFFECT_LINK = 'link'
export const EFFECT_COPY = 'copy'

const EFFECT_NONE = 'none'
const EFFECT_ALL = 'all'
const EFFECT_UNINITIALIZED = 'uninitialized'

const STANDARD_ORDER = [EFFECT_COPY, EFFECT_LINK, EFFECT_MOVE]

const toStandardOrder = (effectList) => {
  const result = [].concat(effectList)
  result.sort((a, b) => STANDARD_ORDER.indexOf(a) - STANDARD_ORDER.indexOf(b))
  return result
}

const camelCase = s => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`

const toStandardName = (effectList) => {
  if (effectList.length === 0) return EFFECT_NONE
  if (effectList.length >= STANDARD_ORDER.length) return EFFECT_ALL
  return toStandardOrder(effectList)
    .map((effect, index) => (index === 0 ? effect : `${camelCase(effect)}`))
    .join()
}

const toList = (effectAllowed) => {
  if (EFFECT_NONE === effectAllowed) return []
  if (EFFECT_ALL === effectAllowed) return [].concat(STANDARD_ORDER)
  return effectAllowed.replace(/([A-Z])/g, '-$1').toLowerCase().split('-')
}

// global state handling

const LOCAL_STORAGE_ID = 'dndState'

let _dndState = null

const clearState = () => {
  _dndState = null
  try {
    localStorage.removeItem(LOCAL_STORAGE_ID)
  } catch (e) {
    stateDebug('Error removing state from localStorage: %s', e)
  }
  stateDebug('Cleared state')
}

const getState = () => {
  if (_dndState) {
    stateDebug('return %o from global js', _dndState)
    return _dndState
  }
  try {
    const localStorageState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ID))
    if (localStorageState) {
      stateDebug('returning %o from localStorage', localStorageState)
      return localStorageState
    }
  } catch (e) {
    stateDebug('got error from localStorage: %s', e)
  }
  stateDebug('returning empty state')
  return {}
}

const setState = (dndState) => {
  stateDebug('setting state to %o', dndState)
  _dndState = dndState
  try {
    localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(dndState))
  } catch (e) {
    stateDebug('got error setting localStorage: %s', e)
  }
}

// data Types

const IE_TEXT = 'text'
const IE_URL = 'url'

export const FORMAT_TEXT = 'text/plain'
export const FORMAT_URL = 'text/uri-list'

const getTextType = (data) => {
  let firstText = null
  let textPlain = null
  for (const key of Object.keys(data)) {
    const lowerKey = key.toLowerCase()
    if (lowerKey === IE_TEXT) return data[key]
    if (key === FORMAT_TEXT) {
      textPlain = data[key]
    }
    if (!firstText && key.startsWith('text/')) {
      firstText = data[key]
    }
  }
  return textPlain || firstText
}

const getURLType = (data) => {
  let textUriList = null
  for (const key of Object.keys(data)) {
    const lowerKey = key.toLowerCase()
    if (lowerKey === IE_URL) return data[key]
    if (key === FORMAT_URL) {
      textUriList = data[key]
    }
  }
  return textUriList
}

// event access

const getEffectAllowed = (event) => {
  try {
    return event.dataTransfer.effectAllowed
  } catch (err) {
    return EFFECT_UNINITIALIZED
  }
}

const getDropEffect = (event) => {
  try {
    return event.dataTransfer.dropEffect || EFFECT_NONE
  } catch (err) {
    return EFFECT_NONE
  }
}

const setDropEffect = (event, dropEffect) => {
  try {
    event.dataTransfer.dropEffect = dropEffect
  } catch (err) {
    // ignore
  }
}

// drop effect

const calculateDropEffect = (event) => {
  const eventEffectAllowed = getEffectAllowed(event)
  const eventDropEffect = getDropEffect(event)
  const dndState = getState()
  const stateEffectsAllowed = dndState.effectsAllowed
  // data is set only on setData() exception,
  // which only occurs in IE<=11,
  // which only allows one effectAllowed
  const limitedEventEffectAllowed = !!dndState.data

  let allowed = [].concat(stateEffectsAllowed || STANDARD_ORDER)

  const filter = effectsAllowed => allowed.filter(effect => effectsAllowed.indexOf(effect) >= 0)
  const isAllowed = effect => allowed.indexOf(effect) >= 0

  if (!limitedEventEffectAllowed
    && eventEffectAllowed !== EFFECT_ALL
    && eventEffectAllowed !== EFFECT_UNINITIALIZED) {
    allowed = filter(toList(eventEffectAllowed))
  }

  if (stateEffectsAllowed) { // internal drag-source
    allowed = filter(stateEffectsAllowed)
  }

  if (event.ctrlKey && !event.shiftKey && isAllowed(EFFECT_COPY) >= 0) {
    return EFFECT_COPY
  }

  if (event.ctrlKey && event.shiftKey && isAllowed(EFFECT_LINK) >= 0) {
    return EFFECT_LINK
  }

  if (isAllowed(eventDropEffect)) {
    return eventDropEffect
  }

  if (allowed.length) {
    return allowed[0]
  }

  return EFFECT_NONE
}

export const getCurrentDropEffect = event => getDropEffect(event)

const setCurrentDropEffect = (event, dropEffect) => {
  const dndState = getState()
  dndState.dropEffect = dropEffect
  setState(dndState)
  setDropEffect(event, dropEffect)
}

// events helper

export const handleDragStart = (event, data, ...effectsAllowed) => {
  const dt = event.dataTransfer
  const dndState = { effectsAllowed }
  dt.effectAllowed = toStandardName(effectsAllowed)
  try {
    for (const key of Object.keys(data)) {
      dt.setData(key, data[key])
    }
  } catch (err) { // IE < Edge
    const text = getTextType(data)
    if (text) {
      dt.setData(IE_TEXT, text)
    }
    const url = getURLType(data)
    if (url) {
      dt.setData(IE_URL, url)
    }
    dt.effectAllowed = effectsAllowed[0]
    dndState.data = data
  }
  setState(dndState)
}

export const handleDragEnd = (event) => {
  const dropEffect = getCurrentDropEffect(event)
  clearState()
  return dropEffect
}

export const handleDragEnter = (event) => {
  const dropEffect = calculateDropEffect(event)
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

export const handleDrop = (event) => {
  const dropEffect = getCurrentDropEffect(event)
  if (dropEffect === EFFECT_NONE) {
    return null
  }
  event.preventDefault()
  setDropEffect(event, dropEffect)
  return dropEffect
}
