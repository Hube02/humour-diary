import { LocalStorageAdapter } from './LocalStorageAdapter'
import type { StorageAdapter } from '../types'

// To switch backends later, change only this line.
export const storage: StorageAdapter = new LocalStorageAdapter()
