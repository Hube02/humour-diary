import { useEffect, useRef, useState } from 'react'
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas'
import { format, parseISO } from 'date-fns'
import { RATINGS, type DayEntry, type Emotion, type Rating } from '../types'

interface Props {
  date: string
  entry: DayEntry | null
  emotions: Emotion[]
  onSave(e: DayEntry): void
  onDelete(date: string): void
  onAddEmotion(e: Emotion): void
  onRemoveEmotion(e: Emotion): void
  onClose(): void
}

const PEN_COLORS = ['#2b1b3d', '#ff4f9a', '#6c8cff', '#38d6c4', '#ff9f43', '#7bd84a']

export default function DayEditor({ date, entry, emotions, onSave, onDelete, onAddEmotion, onRemoveEmotion, onClose }: Props) {
  const canvas = useRef<ReactSketchCanvasRef>(null)
  const [rating, setRating] = useState<Rating | null>(entry?.rating ?? null)
  const [note, setNote] = useState(entry?.note ?? '')
  const [ids, setIds] = useState<string[]>(entry?.emotionIds ?? [])
  const [penColor, setPenColor] = useState(PEN_COLORS[0])
  const [erasing, setErasing] = useState(false)
  const [newEmoji, setNewEmoji] = useState('')
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    if (entry?.drawing?.length) canvas.current?.loadPaths(entry.drawing)
  }, [entry])

  const toggle = (id: string) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const addEmotion = () => {
    if (!newLabel.trim()) return
    const emotion = { id: crypto.randomUUID(), label: newLabel.trim(), emoji: newEmoji.trim() || '✨' }
    onAddEmotion(emotion)
    setIds((s) => [...s, emotion.id])
    setNewEmoji('')
    setNewLabel('')
  }
  const removeEmotion = (emotion: Emotion) => {
    const emotionIndex = ids.indexOf(emotion.id);
    onRemoveEmotion(emotion);
    setIds((s) => {
        s.splice(emotionIndex, 1);
        return [...s]
    })
    setNewEmoji('')
    setNewLabel('')
  }

  const save = async () => {
    if (!rating) return
    const paths = await canvas.current!.exportPaths()
    onSave({ date, rating, note, emotionIds: ids, drawing: paths.length ? paths : null, updatedAt: Date.now() })
  }

  return (
    <aside className="editor" aria-label="Day editor">
      <div className="ed-head">
        <h2>{format(parseISO(date), 'EEEE, d MMMM')}</h2>
        <button className="btn round" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <h3>How did you feel today?</h3>
      <div className="ratings" role="radiogroup">
        {RATINGS.map((r) => (
          <button
            key={r.value}
            role="radio"
            aria-checked={rating === r.value}
            className={`rate${rating === r.value ? ' on' : ''}`}
            style={{ background: r.color }}
            onClick={() => setRating(r.value)}
          >
            <span>{r.emoji}</span><small>{r.label}</small>
          </button>
        ))}
      </div>

      <h3>Emotions</h3>
      <div className="chips">
        {emotions.map((m) => (
            <button key={m.id} className={`chip${ids.includes(m.id) ? ' on' : ''}`} aria-pressed={ids.includes(m.id)} onClick={() => toggle(m.id)}>
                <div key={m.id+'-chip'} style={ids.includes(m.id) ? {background: 'var(--accent)', color: '#fff'} : {background: `var(--card)`, color: `var(--ink)`}} >
                    {m.emoji} {m.label}
                </div>
                <button key={m.id+'-remove'} className={'remove-emotion'} aria-pressed={ids.includes(m.id)} onClick={() => removeEmotion(m)}>
                    ❌
                </button>
            </button>

        ))}
      </div>
      <div className="add-emotion">
        <input className="emoji-in" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} placeholder="🙂" maxLength={4} aria-label="Emoji" />
        <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New emotion" aria-label="Emotion name" onKeyDown={(e) => e.key === 'Enter' && addEmotion()} />
        <button className="btn" onClick={addEmotion}>Add</button>
      </div>

      <h3>Notes</h3>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What made you feel this way?" />

      <h3>Doodle</h3>
      <div className="pens">
        {PEN_COLORS.map((c) => (
          <button key={c} className={`pen${!erasing && penColor === c ? ' on' : ''}`} style={{ background: c }} aria-label={`Pen ${c}`} onClick={() => { setPenColor(c); setErasing(false); canvas.current?.eraseMode(false) }} />
        ))}
        <button className={`btn small${erasing ? ' on' : ''}`} onClick={() => { setErasing(!erasing); canvas.current?.eraseMode(!erasing) }}>Eraser</button>
        <button className="btn small" onClick={() => canvas.current?.undo()}>Undo</button>
        <button className="btn small" onClick={() => canvas.current?.redo()}>Redo</button>
        <button className="btn small" onClick={() => canvas.current?.clearCanvas()}>Clear</button>
      </div>
      <ReactSketchCanvas ref={canvas} className="sketch" height="240px" width="100%" strokeWidth={4} eraserWidth={14} strokeColor={penColor} canvasColor="#ffffff" style={{ border: '3px solid var(--line)', borderRadius: 18, touchAction: 'none' }} />

      <div className="actions">
        <button className="btn primary" disabled={!rating} onClick={save}>{rating ? 'Save day' : 'Pick a rating to save'}</button>
        {entry && <button className="btn danger" onClick={() => onDelete(date)}>Delete</button>}
      </div>
    </aside>
  )
}
