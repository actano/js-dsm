import _debug from 'debug'

const debug = _debug('dnd.state')

const LOCAL_STORAGE_ID = 'dndState'

let _dndState = null

export const clearState = () => {
  _dndState = null
  try {
    localStorage.removeItem(LOCAL_STORAGE_ID)
  } catch (e) {
    debug('Error removing state from localStorage: %s', e)
  }
  debug('Cleared state')
}

export const getState = () => {
  if (_dndState) {
    debug('return %o from global js', _dndState)
    return _dndState
  }
  try {
    const localStorageState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ID))
    if (localStorageState) {
      debug('returning %o from localStorage', localStorageState)
      return localStorageState
    }
  } catch (e) {
    debug('got error from localStorage: %s', e)
  }
  debug('returning empty state')
  return {}
}

export const setState = (dndState) => {
  debug('setting state to %o', dndState)
  _dndState = dndState
  try {
    localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(dndState))
  } catch (e) {
    debug('got error setting localStorage: %s', e)
  }
}

