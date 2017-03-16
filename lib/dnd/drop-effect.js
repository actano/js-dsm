import _debug from 'debug'

import { getDropEffect } from './event-access'
import { EFFECT_ALL, EFFECT_COPY, EFFECT_LINK, EFFECT_NONE, toList,
} from './effects'

const debug = _debug('dnd.drop-effect')

const isAllowed = (allowed, effect) => allowed.indexOf(effect) >= 0

export default (event) => {
  const eventDropEffect = getDropEffect(event)

  // start with allowed (or all) effects
  const allowed = toList(EFFECT_ALL)
  debug('starting with dropEffect "%s" and allowed effects "%s"', eventDropEffect, allowed.join('/'))

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

