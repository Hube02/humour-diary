import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isToday, startOfMonth } from 'date-fns'
import { RATINGS, type DayEntry, type Emotion } from '../types'

interface Props {
  month: Date
  entries: Record<string, DayEntry>
  emotions: Emotion[]
  selected: string | null
  onMonthChange(d: Date): void
  onSelect(date: string): void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar({ month, entries, emotions, selected, onMonthChange, onSelect }: Props) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const offset = (getDay(days[0]) + 6) % 7 // Monday first

  return (
    <section className="calendar" aria-label="Calendar">
      <div className="cal-head">
        <button className="btn round" onClick={() => onMonthChange(addMonths(month, -1))} aria-label="Previous month">‹</button>
        <h2>{format(month, 'MMMM yyyy')}</h2>
        <button className="btn round" onClick={() => onMonthChange(addMonths(month, 1))} aria-label="Next month">›</button>
      </div>
      <div className="grid">
        {WEEKDAYS.map((d) => <div key={d} className="wd">{d}</div>)}
        {Array.from({ length: offset }, (_, i) => <div key={`o${i}`} />)}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const e = entries[key]
          const rating = e && RATINGS[e.rating - 1]
          const emojis = e ? e.emotionIds.map((id) => emotions.find((m) => m.id === id)?.emoji).filter(Boolean).slice(0, 3) : []
          return (
            <button
              key={key}
              className={`day${selected === key ? ' sel' : ''}${isToday(day) ? ' today' : ''}`}
              style={rating ? { background: rating.color } : undefined}
              onClick={() => onSelect(key)}
              aria-label={`${format(day, 'EEEE d MMMM')}${rating ? `, rated ${rating.label}` : ''}`}
            >
              <span className="num">{format(day, 'd')}</span>
              {rating && <span className="face">{rating.emoji}</span>}
              <span className="dots">{emojis.join('')}{e?.drawing ? '✏️' : ''}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
