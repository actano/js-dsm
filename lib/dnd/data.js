// data Types

export const IE_TEXT = 'text'
export const IE_URL = 'url'

export const FORMAT_TEXT = 'text/plain'
export const FORMAT_URL = 'text/uri-list'

export const getTextType = (data) => {
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

export const getURLType = (data) => {
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

