import type { CanvasPath } from 'react-sketch-canvas'

export type Rating = 1 | 2 | 3 | 4 | 5

export interface DayEntry {
  date: string // YYYY-MM-DD
  rating: Rating
  note: string
  emotionIds: string[]
  drawing: CanvasPath[] | null // vector strokes
  updatedAt: number
}

export interface Emotion {
  id: string
  label: string
  emoji: string
}

export interface BackupFile {
  version: 1
  exportedAt: number
  entries: DayEntry[]
  emotions: Emotion[]
}

/** Every storage backend (localStorage, IndexedDB, cloud…) implements this. */
export interface StorageAdapter {
  getEntry(date: string): Promise<DayEntry | null>
  saveEntry(entry: DayEntry): Promise<void>
  deleteEntry(date: string): Promise<void>
  getEntriesForMonth(month: string): Promise<DayEntry[]> // 'YYYY-MM'
  getEmotions(): Promise<Emotion[]>
  saveEmotions(list: Emotion[]): Promise<void>
  exportAll(): Promise<BackupFile>
  importAll(data: BackupFile): Promise<void>
}

export const RATINGS: { value: Rating; emoji: string; label: string; color: string }[] = [
  { value: 1, emoji: '😥', label: 'Sad', color: 'var(--r1)' },
  { value: 2, emoji: '😐', label: 'Meh', color: 'var(--r2)' },
  { value: 3, emoji: '🙂', label: 'Nice', color: 'var(--r3)' },
  { value: 4, emoji: '😄', label: 'Fun', color: 'var(--r4)' },
  { value: 5, emoji: '😂', label: 'Great', color: 'var(--r5)' },
]
