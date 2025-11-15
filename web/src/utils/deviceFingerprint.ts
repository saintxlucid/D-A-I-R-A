import { v4 as uuidv4 } from 'uuid'

export function getDeviceHash() {
  try {
    const existing = sessionStorage.getItem('daira_device_hash')
    if (existing) return existing
    const next = uuidv4()
    sessionStorage.setItem('daira_device_hash', next)
    return next
  } catch (err) {
    return uuidv4()
  }
}

export default getDeviceHash
