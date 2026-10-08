import type { BackupFile, DayEntry, Emotion, StorageAdapter } from '../types'

const ENTRIES_KEY = 'humour:entries'
const EMOTIONS_KEY = 'humour:emotions'

const DEFAULT_EMOTIONS: Emotion[] = [
  ['joyful', 'Joyful', '😊'], ['excited', 'Excited', '🤩'], ['calm', 'Calm', '😌'],
  ['silly', 'Silly', '🤪'], ['loved', 'Loved', '🥰'], ['tired', 'Tired', '😴'],
  ['anxious', 'Anxious', '😰'], ['sad', 'Sad', '😢'], ['angry', 'Angry', '😠'], ['bored', 'Bored', '🥱'],
].map(([id, label, emoji]) => ({ id, label, emoji }))

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value)) // throws if quota exceeded
}

export class LocalStorageAdapter implements StorageAdapter {
  private entries(): Record<string, DayEntry> {
    return read<Record<string, DayEntry>>(ENTRIES_KEY, {})
  }

  async getEntry(date: string) {
    return this.entries()[date] ?? null
  }

  async saveEntry(entry: DayEntry) {
    write(ENTRIES_KEY, { ...this.entries(), [entry.date]: entry })
  }

  async deleteEntry(date: string) {
    const all = this.entries()
    delete all[date]
    write(ENTRIES_KEY, all)
  }

  async getEntriesForMonth(month: string) {
    return Object.values(this.entries()).filter((e) => e.date.startsWith(month))
  }

  async getEmotions() {
    return read<Emotion[]>(EMOTIONS_KEY, DEFAULT_EMOTIONS)
  }

  async saveEmotions(list: Emotion[]) {
    write(EMOTIONS_KEY, list)
  }

  async exportAll(): Promise<BackupFile> {
    return {
      version: 1,
      exportedAt: Date.now(),
      entries: Object.values(this.entries()),
      emotions: await this.getEmotions(),
    }
  }

  async importAll(data: BackupFile) {
    if (data?.version !== 1 || !Array.isArray(data.entries) || !Array.isArray(data.emotions)) {
      throw new Error('This file is not a Humour Diary backup.')
    }
    write(ENTRIES_KEY, Object.fromEntries(data.entries.map((e) => [e.date, e])))
    write(EMOTIONS_KEY, data.emotions)
  }
}
