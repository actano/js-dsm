// effects

export const EFFECT_MOVE = 'move'
export const EFFECT_LINK = 'link'
export const EFFECT_COPY = 'copy'

export const EFFECT_NONE = 'none'
export const EFFECT_ALL = 'all'
export const EFFECT_UNINITIALIZED = 'uninitialized'

const STANDARD_ORDER = [EFFECT_COPY, EFFECT_LINK, EFFECT_MOVE]

const toStandardOrder = (effectList) => {
  const result = [].concat(effectList)
  result.sort((a, b) => STANDARD_ORDER.indexOf(a) - STANDARD_ORDER.indexOf(b))
  return result
}

const camelCase = s => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`

export const toStandardName = (effectList) => {
  if (effectList.length === 0) return EFFECT_NONE
  if (effectList.length >= STANDARD_ORDER.length) return EFFECT_ALL
  return toStandardOrder(effectList)
    .map((effect, index) => (index === 0 ? effect : `${camelCase(effect)}`))
    .join('')
}

export const toList = (effectAllowed) => {
  if (EFFECT_NONE === effectAllowed) return []
  if (EFFECT_ALL === effectAllowed) return [].concat(STANDARD_ORDER)
  return effectAllowed.replace(/([A-Z])/g, '-$1').toLowerCase().split('-')
}

