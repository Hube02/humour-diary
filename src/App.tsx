import { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import Calendar from './components/Calendar'
import DayEditor from './components/DayEditor'
import { storage } from './storage'
import type { BackupFile, DayEntry, Emotion } from './types'

export default function App() {
  const [month, setMonth] = useState(new Date())
  const [entries, setEntries] = useState<Record<string, DayEntry>>({})
  const [emotions, setEmotions] = useState<Emotion[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('humour:theme')
    if (saved === 'light' || saved === 'dark') return saved
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('humour:theme', theme)
  }, [theme])

  const loadMonth = useCallback(async () => {
    const list = await storage.getEntriesForMonth(format(month, 'yyyy-MM'))
    setEntries(Object.fromEntries(list.map((e) => [e.date, e])))
  }, [month])

  useEffect(() => { loadMonth() }, [loadMonth])
  useEffect(() => { storage.getEmotions().then(setEmotions) }, [])

  const guard = async (fn: () => Promise<void>) => {
    try { setError(''); await fn() } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.') }
  }

  const save = (entry: DayEntry) => guard(async () => { await storage.saveEntry(entry); await loadMonth(); setSelected(null) })
  const remove = (date: string) => guard(async () => { await storage.deleteEntry(date); await loadMonth(); setSelected(null) })
  const addEmotion = (e: Emotion) => guard(async () => { const next = [...emotions, e]; await storage.saveEmotions(next); setEmotions(next) })
  const removeEmotion = (e: Emotion) => guard(async () => {emotions.splice(emotions.findIndex((el) => el.id === e.id), 1); const next = [...emotions]; await storage.saveEmotions(next); setEmotions(next) })

  const exportData = () => guard(async () => {
    const blob = new Blob([JSON.stringify(await storage.exportAll(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `humour-diary-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  })

  const importData = (file: File) => guard(async () => {
    const data = JSON.parse(await file.text()) as BackupFile
    await storage.importAll(data)
    setEmotions(await storage.getEmotions())
    await loadMonth()
  })

  return (
    <div className="app">
      <header>
        <h1>Humour Diary</h1>
        <div className="tools">
          <button className="btn small" onClick={exportData}>Export</button>
          <button className="btn small" onClick={() => fileInput.current?.click()}>Import</button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = '' }} />
          <button className="btn small" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark mode">{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      <main className="layout">
        <Calendar month={month} entries={entries} emotions={emotions} selected={selected} onMonthChange={setMonth} onSelect={setSelected} />
        {selected ? (
          <DayEditor key={selected} date={selected} entry={entries[selected] ?? null} emotions={emotions} onSave={save} onDelete={remove} onAddEmotion={addEmotion} onRemoveEmotion={removeEmotion} onClose={() => setSelected(null)} />
        ) : (
          <aside className="placeholder"><p>Tap a day to rate it, tag how you felt, and doodle.</p></aside>
        )}
      </main>
    </div>
  )
}
