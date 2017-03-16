import _debug from 'debug'

import { getEffectAllowed, getDropEffect } from './event-access'
import { getState } from './state'
import { EFFECT_ALL, EFFECT_UNINITIALIZED, EFFECT_COPY, EFFECT_LINK, EFFECT_NONE, toList,
} from './effects'

const debug = _debug('dnd.drop-effect')

const filter = (allowed, effectsAllowed) =>
  allowed.filter(effect => effectsAllowed.indexOf(effect) >= 0)

const isAllowed = (allowed, effect) => allowed.indexOf(effect) >= 0

export default (event, ...effectsAllowed) => {
  const eventDropEffect = getDropEffect(event)
  const dndState = getState()
  const stateEffectsAllowed = dndState.effectsAllowed
  // dndState.data is set only on event.setData() exception,
  // which only occurs in IE<=11,
  // which only allows one effectAllowed
  // so we don't have the correct list in event
  // so use 'all' in this case
  const eventEffectAllowed = dndState.data ? EFFECT_ALL : getEffectAllowed(event)

  // start with allowed (or all) effects
  let allowed = effectsAllowed.length === 0 ? toList(EFFECT_ALL) : effectsAllowed
  debug('starting with dropEffect "%s" and allowed effects "%s"', eventDropEffect, allowed.join('/'))

  // filter, if we expect a valid list of effectsAllowd in event
  if (eventEffectAllowed !== EFFECT_UNINITIALIZED) {
    allowed = filter(allowed, toList(eventEffectAllowed))
    debug('filtered by eventEffectAllowed "%s" to %s', eventEffectAllowed, allowed.join('/'))
  }

  // filter, if internal dnd
  if (stateEffectsAllowed) {
    allowed = filter(allowed, stateEffectsAllowed)
    debug('filtered by state "%s" to %s', stateEffectsAllowed.join('/'), allowed.join('/'))
  }

  // evaluate modifiers only, if browser does no preselection
  // cases currently:
  // 1. browser uses modifier keys to set dropEffect: Firefox Mac/Win
  // 2. browser uses modifier keys to limit effectsAllowed (dropEffect=none): Safari, Chrome Mac
  // 3. browser does not respect modifier keys (dropEffect=none): Chrome Win, IE11
  if (EFFECT_NONE === eventDropEffect) {
    // Mac browsers do no harm here, because they filtered the EFFECT out of effectsAllowed already
    if (event.ctrlKey && !event.shiftKey && isAllowed(allowed, EFFECT_COPY)) {
      debug('force to "copy" from modifier keys')
      return EFFECT_COPY
    }

    if (event.ctrlKey && event.shiftKey && isAllowed(allowed, EFFECT_LINK)) {
      debug('force to "link" from modifier keys')
      return EFFECT_LINK
    }
  } else if (isAllowed(allowed, eventDropEffect)) {
    debug('use dropEffect "%s" from event', eventDropEffect)
    return eventDropEffect
  }

  if (allowed.length) {
    debug('use "%s" as first remaining', allowed[0])
    return allowed[0]
  }

  debug('fall back to "none"')
  return EFFECT_NONE
}

