import type { InterviewEntry } from '../types'
import EntryCard from './EntryCard'
import EmptyState from './EmptyState'

export default function EntryList({
  entries,
  onAdd,
}: {
  entries: InterviewEntry[]
  onAdd: () => void
}) {
  if (entries.length === 0) {
    return <EmptyState onAdd={onAdd} />
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      {entries.map((entry, i) => (
        <EntryCard key={entry.id} entry={entry} index={i} />
      ))}
    </div>
  )
}
